using Fitness.Core.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Infrastructure.External
{
    public class WebDavStorageService : ICloudStorageService
    {
        private readonly string _webDavUrl;
        private readonly string _username;
        private readonly string _password;
        private readonly string _basePath;
        private readonly ILogger<WebDavStorageService> _logger;

        public WebDavStorageService(
            string webDavUrl,
            string username,
            string password,
            string basePath = "trainers",
            ILogger<WebDavStorageService> logger = null)
        {
            _webDavUrl = webDavUrl.TrimEnd('/') + "/";
            _username = username;
            _password = password;
            _basePath = basePath.Trim('/');
            _logger = logger;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
        {
            const int maxRetries = 3;
            var retryCount = 0;
            Exception lastException = null;

            while (retryCount < maxRetries)
            {
                try
                {
                    var fullPath = $"{_basePath}/{Guid.NewGuid()}{Path.GetExtension(fileName)}";
                    var requestUri = new Uri(new Uri(_webDavUrl), fullPath);

                    _logger?.LogInformation($"Попытка загрузки {retryCount + 1} : {fileName}");

                    var request = (HttpWebRequest)WebRequest.Create(requestUri);
                    request.Method = "PUT";
                    request.Credentials = new NetworkCredential(_username, _password);
                    request.ContentType = "application/octet-stream";
                    request.Timeout = 300000; 
                    request.ReadWriteTimeout = 300000;
                    request.KeepAlive = false; 
                    request.ServicePoint.Expect100Continue = false;

                    if (fileStream.CanSeek)
                    {
                        fileStream.Position = 0;
                    }

                    using (var memoryStream = new MemoryStream())
                    {
                        await fileStream.CopyToAsync(memoryStream);
                        memoryStream.Position = 0;

                        using (var requestStream = await request.GetRequestStreamAsync())
                        {
                            await memoryStream.CopyToAsync(requestStream);
                            await requestStream.FlushAsync();
                        }
                    }

                    using (var response = (HttpWebResponse)await request.GetResponseAsync())
                    {
                        if (response.StatusCode == HttpStatusCode.Conflict)
                        {
                            await CreateDirectoryIfNotExists(_basePath);
                            continue;
                        }
                        else if (response.StatusCode != HttpStatusCode.Created &&
                                response.StatusCode != HttpStatusCode.OK)
                        {
                            throw new Exception($"Ошибка загрузки файла: {response.StatusCode}");
                        }
                    }

                    _logger?.LogInformation($"Файл успешно загружен: {requestUri}");
                    return requestUri.ToString();
                }
                catch (WebException ex) when (ex.Status == WebExceptionStatus.ConnectFailure ||
                                            ex.Status == WebExceptionStatus.ConnectionClosed ||
                                            ex.Status == WebExceptionStatus.SendFailure)
                {
                    lastException = ex;
                    retryCount++;
                    _logger?.LogWarning($"Загрузка не удалась, повторите попытку {retryCount}/{maxRetries}. Error: {ex.Message}");

                    await Task.Delay(1000 * retryCount);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Ошибка загрузки файла");
                    throw;
                }
            }

            _logger?.LogError(lastException, "Все попытки загрузки не удались");
            throw new Exception("Не удалось загрузить файл после нескольких попыток", lastException);
        }

        private async Task CreateDirectoryIfNotExists(string path)
        {
            var dirs = path.Split('/');
            var currentPath = string.Empty;

            foreach (var dir in dirs)
            {
                if (string.IsNullOrEmpty(dir)) continue;

                currentPath += $"/{dir}";
                var dirUri = new Uri(new Uri(_webDavUrl), currentPath.TrimStart('/'));

                var request = (HttpWebRequest)WebRequest.Create(dirUri);
                request.Method = "MKCOL";
                request.Credentials = new NetworkCredential(_username, _password);
                request.Timeout = 30000;

                try
                {
                    using (var response = (HttpWebResponse)await request.GetResponseAsync())
                    {
                        if (response.StatusCode != HttpStatusCode.Created &&
                            response.StatusCode != HttpStatusCode.OK)
                        {
                            _logger?.LogWarning($"Не удалось создать каталог {currentPath}: {response.StatusCode}");
                        }
                    }
                }
                catch (WebException ex) when ((ex.Response as HttpWebResponse)?.StatusCode == HttpStatusCode.MethodNotAllowed)
                {
                    continue;
                }
            }
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
                return;

            var request = (HttpWebRequest)WebRequest.Create(fileUrl);
            request.Method = "DELETE";
            request.Credentials = new NetworkCredential(_username, _password);

            using (var response = (HttpWebResponse)await request.GetResponseAsync())
            {
                if (response.StatusCode != HttpStatusCode.OK &&
                    response.StatusCode != HttpStatusCode.NoContent &&
                     response.StatusCode != HttpStatusCode.NotFound)
                {
                    throw new Exception($"Ошибка удаления файла: {response.StatusCode}");
                }
            }
        }

        public async Task<Stream> DownloadFileAsync(string fileUrl)
        {
            var request = (HttpWebRequest)WebRequest.Create(fileUrl);
            request.Method = "GET";
            request.Credentials = new NetworkCredential(_username, _password);

            var response = (HttpWebResponse)await request.GetResponseAsync();
            return response.GetResponseStream();
        }
    }
}
