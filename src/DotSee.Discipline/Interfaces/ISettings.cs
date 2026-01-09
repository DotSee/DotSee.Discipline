namespace DotSee.Discipline.Interfaces
{
    public interface ISettings<T> where T : class
    {
        T Settings { get; }
    }
}
