using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface ICloudStorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName);
        Task DeleteFileAsync(string fileUrl);
        Task<Stream> DownloadFileAsync(string fileUrl);
    }
}
