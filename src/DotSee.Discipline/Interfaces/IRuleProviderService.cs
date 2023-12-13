using Microsoft.CodeAnalysis.CSharp.Syntax;
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
    public interface ISettings<T> where T:class
    {
        T Settings { get;  }
    }
    public interface IRuleProviderService<TRules> : IRuleProviderService   where TRules : class
    {       
        TRules Rules { get; }
    }
}
