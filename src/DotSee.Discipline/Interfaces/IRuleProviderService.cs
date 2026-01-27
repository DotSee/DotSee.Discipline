namespace DotSee.Discipline.Interfaces
{
    public interface IRuleProviderService
    {
        void ReloadData();
    }
    //public interface ISettings<T> where T : class
    //{
    //    T Settings { get; }
    //}
    public interface IRuleProviderService<TRules> : IRuleProviderService where TRules : class
    {
        TRules Rules { get; }
    }
}
