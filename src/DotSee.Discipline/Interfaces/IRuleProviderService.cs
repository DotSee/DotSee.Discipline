using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DotSee.Discipline.Interfaces
{
    public interface IRuleProviderService
    {
        void ReloadData();
    }
    public interface IRuleProviderService<TSettings,TRules> : IRuleProviderService where TSettings :class where TRules : class
    {
        TSettings Settings { get;  }
        TRules Rules { get; }
    }
}
