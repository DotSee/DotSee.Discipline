using System.Collections.Generic;
using System.Xml;

namespace DotSee.Discipline.AutoNode
{
    public interface IRuleProviderService
    {
        RuleSettings Settings { get; }
        IEnumerable<Rule> Rules { get; }
        //XmlDocument XmlConfig { get; }
        void ReloadData();
    }

    public interface IConfigSource
    {
        string SourcePath { get; set; }
    }
  

   
}