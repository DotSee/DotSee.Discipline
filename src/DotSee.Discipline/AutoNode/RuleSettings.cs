using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DotSee.Discipline.AutoNode
{
    public class RuleSettings
    {
        public string LogLevel { get; set; } = "Normal";
        public bool RepublishExistingNodes { get; set; } = false;
    }
}
