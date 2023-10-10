namespace DotSee.Discipline.AutoNode
{
    public class ConfigSource : IConfigSource
    {
        /// <summary>
        /// Default is \config\autoNode.config
        /// </summary>
        public string SourcePath { get; set; } = @"\App_Plugins\DotSee.AutoNode\autoNode.json";
    }
}