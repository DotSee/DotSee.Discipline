using DotSee.Discipline.Interfaces;
using DotSee.Discipline.NodeRestrict;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence;

namespace DotSee.Discipline.Tests
{
    [TestFixture(TypeArgs = new[] { typeof(NodeRestrictService) })]
    public class NodeRestrictTests
    {
        private Mock<IContent> parent;
        private Mock<IContent> child;
        private Mock<IContent> child2;
        private Mock<IContentService> _contentService;
        private Mock<ISqlContext> _sqlContext;
        private Mock<IContentTypeService> _contentTypeService;
        private readonly NodeRestrictService _nodeRestrictService;

        //public NodeRestrictTests(NodeRestrictService nodeRestrictService)
        //{
        //    _nodeRestrictService = nodeRestrictService;
        //}

        [SetUp]
        public void Setup()
        {
            var parentContentTypeName = "parentContentType";
            var childContentTypeName = "childContentType";
            var parentContentTypeId = 1000;
            var childContentTypeId = 1001;
            var parentNodeId = 1;
            var childNodeId1 = 2;
            var childNodeId2 = 3;

            parent = new Mock<IContent>();
            child = new Mock<IContent>();
            child2 = new Mock<IContent>();
            _contentService = new Mock<IContentService>();
            _contentTypeService = new Mock<IContentTypeService>();
            _sqlContext = new Mock<ISqlContext>();

            //Set up parent node 
            parent.Setup(x => x.Name).Returns("Homepage");
            parent.Setup(x => x.Id).Returns(parentNodeId);
            parent.Setup(x => x.Level).Returns(1);
            parent.Setup(x => x.ContentType.Alias).Returns(parentContentTypeName);
            parent.Setup(x => x.Published).Returns(true);
            parent.Setup(x => x.ContentTypeId).Returns(parentContentTypeId);

            //Set up UNPUBLISHED child node - this is the node we're testing with.
            child.Setup(x => x.Name).Returns("ContentPage");
            child.Setup(x => x.Id).Returns(childNodeId1);
            child.Setup(x => x.Level).Returns(2);
            child.Setup(x => x.ContentType.Alias).Returns(childContentTypeName);
            child.Setup(x => x.ParentId).Returns(1);
            child.Setup(x => x.Published).Returns(false);
            child.Setup(x => x.ContentTypeId).Returns(childContentTypeId);

            //Set up PUBLISHED child node - this is the node supposedly existing already under the parent.
            child2.Setup(x => x.Name).Returns("ContentPage2");
            child2.Setup(x => x.Id).Returns(childNodeId2);
            child2.Setup(x => x.Level).Returns(2);
            child2.Setup(x => x.ContentType.Alias).Returns(childContentTypeName);
            child2.Setup(x => x.ParentId).Returns(1);
            child2.Setup(x => x.Published).Returns(true);
            child2.Setup(x => x.ContentTypeId).Returns(childContentTypeId);

            //Set up mock parent and child doctypes
            var mockParentType = new Mock<IContentType>();
            mockParentType.Setup(x => x.Id).Returns(parentContentTypeId);
            mockParentType.Setup(x => x.Name).Returns(parentContentTypeName);

            var mockChildType = new Mock<IContentType>();
            mockChildType.Setup(x => x.Id).Returns(childContentTypeId);
            mockChildType.Setup(x => x.Name).Returns(childContentTypeName);

            //Set up mocks for content service when asked for doctypes
            _contentTypeService.Setup(x => x.Get(parentContentTypeName)).Returns(mockParentType.Object);
            _contentTypeService.Setup(x => x.Get(childContentTypeName)).Returns(mockChildType.Object);

            //Set up mocks for content service when asked for doc ids
            _contentService.Setup(x => x.GetById(parentNodeId)).Returns(parent.Object);
            _contentService.Setup(x => x.GetById(childNodeId1)).Returns(child.Object);

            //Set up mocks for sqlContext - need to do that since it's referenced in the service
            _sqlContext.Setup(x => x.Query<IContent>().Where(x => x.Published))
                .Returns(new Umbraco.Cms.Infrastructure.Persistence.Querying.Query<IContent>(_sqlContext.Object)
                );

        }

        [Test]
        public void TestLimitReached()
        {
            //Create a test rule
            var testRules = new List<Rule>();
            var testRule = new Rule
            {
                ChildDocType = "childContentType",
                ParentDocType = "parentContentType",
                MaxNodes = 1
            };

            //Mock settings and provider to get the rule into the provider
            var settings = new Mock<NodeRestrictSettings>();
            var providerService =
                new Mock<IRuleProviderService<IEnumerable<Rule>>>();
            var providerServiceSettingsInterface = providerService.As<ISettings<NodeRestrictSettings>>();
            providerServiceSettingsInterface.Setup(x => x.Settings).Returns(settings.Object);

            providerService.Setup(x => x.Rules).Returns(testRules);

            //Mock GetPagedChildren to return what we need here.
            _ = _contentService.Setup(x => x.GetPagedChildren(1, 0, testRule.MaxNodes, out It.Ref<long>.IsAny, null, null))
                .Returns(new List<IContent>() { child.Object, child2.Object }.AsEnumerable());

            var nrs = new NodeRestrictService(
                _contentService.Object,
                _sqlContext.Object,
                providerService.Object,
                _contentTypeService.Object);

            nrs.RegisterRule(testRule);

            var result = nrs.Run(child.Object);
            Assert.IsTrue(result?.LimitReached);
        }
    }
}