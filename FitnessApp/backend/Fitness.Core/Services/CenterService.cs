using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Services
{
    public class CenterService : ICenterService
    {
        private readonly IRepository<Center> _repository;

        public CenterService(IRepository<Center> repository)
        {
            _repository = repository;
        }

        public async Task Add(Center center)
        {
            var errors = ValidateCenter(center);
            if (errors.Any())
                throw new ValidException(errors);

            await ValidateCenterUniqueness(center);
            await _repository.AddAsync(center);
        }

        public async Task Delete(int id)
        {
            var center = await _repository.GetByIdAsync(id);
            if (center == null)
            {
                throw new ApiException(
                    "CENTER_NOT_FOUND",
                    "Центр не найден",
                    HttpStatusCode.NotFound);
            }

            await _repository.DeleteAsync(center);
        }

        public async Task<IEnumerable<Center>> GetAll()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Center?> GetById(int id)
        {
            var center = await _repository.GetByIdAsync(id);
            if (center == null)
            {
                throw new ApiException(
                    "CENTER_NOT_FOUND",
                    "Центр не найден",
                    HttpStatusCode.NotFound);
            }
            return center;
        }

        public async Task Update(Center center)
        {
            var exist = await _repository.GetByIdAsync(center.CenterId);
            if (exist == null)
            {
                throw new ApiException(
                    "CENTER_NOT_FOUND",
                    "Центр не найден",
                    HttpStatusCode.NotFound);
            }
            var errors = ValidateCenter(center);
            if (errors.Any())
                throw new ValidException(errors);

            await ValidateCenterUniqueness(center, center.CenterId);

            exist.CenterName = center.CenterName;
            exist.City = center.City;
            exist.Address = center.Address;
            exist.Phone = center.Phone;
            exist.Latitude = center.Latitude;
            exist.Longitude = center.Longitude;

            await _repository.UpdateAsync(exist);
        }

        private string NormalizePhone(string phone)
        {
            return new string(phone.Where(char.IsDigit).ToArray());
        }

        private Dictionary<string, string[]> ValidateCenter(Center center)
        {
            var errors = new Dictionary<string, string[]>();

            if (string.IsNullOrWhiteSpace(center.CenterName))
                errors.Add(nameof(center.CenterName), ["Название центра обязательно"]);

            if (string.IsNullOrWhiteSpace(center.Address))
                errors.Add(nameof(center.Address), ["Адрес обязателен"]);

            if (string.IsNullOrWhiteSpace(center.City))
                errors.Add(nameof(center.City), ["Город обязателен"]);

            if (string.IsNullOrWhiteSpace(center.Phone))
                errors.Add(nameof(center.Phone), ["Телефон обязателен"]);

            if (!center.Latitude.HasValue || !center.Longitude.HasValue)
                errors.Add("Coordinates", ["Координаты обязательны"]);

            return errors;
        }

        private async Task ValidateCenterUniqueness(Center center, int? excludeId = null)
        {
            var normalizedPhone = NormalizePhone(center.Phone);

            if (await _repository.ExistsAsync(c =>
                c.CenterId != excludeId &&
                c.CenterName.ToLower() == center.CenterName.ToLower()))
            {
                throw new ApiException(
                    "CENTER_NAME_EXISTS",
                    "Центр с таким названием уже существует",
                    HttpStatusCode.Conflict);
            }

            var allCenters = await _repository.GetAllAsync();
            var centersToCheck = excludeId.HasValue
                ? allCenters.Where(c => c.CenterId != excludeId.Value)
                : allCenters;

            if (centersToCheck.Any(c => NormalizePhone(c.Phone) == normalizedPhone))
            {
                throw new ApiException(
                    "CENTER_PHONE_EXISTS",
                    "Центр с таким телефоном уже существует",
                    HttpStatusCode.Conflict);
            }

            if (await _repository.ExistsAsync(c =>
                c.CenterId != excludeId &&
                c.Address.ToLower() == center.Address.ToLower() &&
                c.City.ToLower() == center.City.ToLower()))
            {
                throw new ApiException(
                    "CENTER_ADDRESS_EXISTS",
                    "Центр с таким адресом уже существует в этом городе",
                    HttpStatusCode.Conflict);
            }
        }
    }
}
