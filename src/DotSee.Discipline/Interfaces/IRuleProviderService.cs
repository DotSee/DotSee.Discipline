namespace DotSee.Discipline.Interfaces
{
    public interface IRuleProviderService
    {
        void ReloadData();
    }
    public interface IRuleProviderService<TRules> : IRuleProviderService where TRules : class
    {
        TRules Rules { get; }
    }
}
