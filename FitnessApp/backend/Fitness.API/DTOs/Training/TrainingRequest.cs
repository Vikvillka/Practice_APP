namespace Fitness.API.DTOs.Training
{
    public class TrainingRequest
    {
        public DateTime DateTime { get; set; }
        public decimal Price { get; set; }
        public int TemplateId { get; set; }
        public int CenterId { get; set; }
        public int TrainerId { get; set; }
    }
}
