using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Entities
{
    public class Token
    {
        public int TokenID { get; set; }
        public string RefreshToken { get; set; } = null!;
        public DateTime Expires { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public string CreatedByIp { get; set; } = null!;
        public bool IsRevoked { get; set; }
        public DateTime? Revoked { get; set; }
        public string? RevokedByIp { get; set; }
        public string? ReplacedByToken { get; set; }

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= Expires;
        [NotMapped]
        public bool IsActive => !IsRevoked && !IsExpired;

        public int UserId { get; set; }
        [NotMapped]
        public User User { get; set; }
    }
}
