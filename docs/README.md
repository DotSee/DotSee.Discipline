This is a plugin for Umbraco V10+ combining the functionality of the following legacy V8 plugins:
- **AutoNode**: Automatically create new nodes upon publishing a node, based on rules
- **NodeRestrict**: Restrict number of nodes to be created under a node, based on rules
- **VirtualNodes**: Hide the url segment of a specific node based on doctype
- **HideNotCreatedVariants**: Toggle show/hide of non-created variants for languages in the back office

# General Notes
In your appSettings.json, create a new root level entry as follows:

```
 "DotSee.Discipline": {

    [Specific configs go here]
 
 }
```

and then use the configuration for any of the functions you need to use. 
All functionality is disabled by default, so if you do not include configuration for a specific functionality it won't kick in at all.

# Restricting creation of new nodes in the Umbraco back office (formerly NodeRestrict)

You can restrict the number of allowed published child nodes either via rules defined in appsettings.json (parent doctype - child doctype) or via a special property in a single node (limiting the number of children of any doctype).

These two methods of defining restrictions can co-exist.

If the max number of allowed nodes is reached, new nodes will be saved but not published and a message (standard or custom) will inform the user of the restriction. The back-end can also optionally display warning messages before the max number of children is reached to inform the user of the restriction and the allowed number of child nodes remaining.

## Configuration

Below is an example of an actual configuration in appsettings.json, under the "DotSee.Discipline" entry:

``` 
  "NodeRestrict": {
      "Settings": {
        "PropertyAlias": null,
        "ShowWarnings": true
      },
      "Rules": [
        {
          "ParentDocType": "pageHome",
          "ChildDocType": "pageSiteMap",
          "MaxNodes": 1,
          "ShowWarnings": false,
          "CustomMessage": "",
          "CustomMessageCategory": "",
          "CustomWarningMessage": "",
          "CustomWarningMessageCategory": ""
        },
        {
          "ParentDocType": "pageHome",
          "ChildDocType": "page404",
          "MaxNodes": 1,
          "ShowWarnings": true,
          "CustomMessage": "You can't have more than one 404 pages on a website/",
          "CustomMessageCategory": "404 page checker",
          "CustomWarningMessage": "You have created a 404 page. Subsequent 404 pages will be saved but not published.",
          "CustomWarningMessageCategory": "404 page checker"
        }
      ]
    }
```

You can define rules for parent/child sets based on document type as well as use a special property on any page that will define the number of allowed children (of any doctype) for that specific page only.

A rule has the following attributes:

**parentDocType**: The document type alias of the parent of the document being published. You can alternatively use the "\*" character here to match all document types.
**childDocType**: The document type alias of the document being published. You can alternatively use the "\*" character here to match all document types.
**maxNodes**: The maximum number of "childDocType" nodes allowed under a "ParentDocType" node.
**showWarnings**: When set, displays warning messages regarding the number of nodes allowed if a rule is matched but the maximum number of children has not yet been reached.
**customMessage**: Overrides the standard message when the maximum number of nodes has been reached.
**customMessageCategory** Overrides the standard category literal when the maximum number of nodes has been reached. Standard literal is "Publish".
**customWarningMessage**: Overrides the standard warning message when a rule is matched but maximum number of nodes has not yet been reached.
**customWarningMessageCategory**: verrides the standard category literal when a rule is matched but maximum number of nodes has not yet been reached. Standard literal is "Publish".

A rule is matched only when "parentDocType" and "childDocType" match. That is, the document being published must be of "childDocType" and its parent document must be of "parentDocType". In our example, the rule applies if we publish a "LandingPage" document under a "Home" document.

There are also two attributes on the root node itself:

**propertyAlias**: The alias of the property expected to be found in a document to limit its number of children. This must be a numeric property.
**showWarnings**: Show warning messages in case a property with the "propertyAlias" is found but the limit defined there has not been reached.

## Examples

Let's suppose that, on your site, you have pages of type "Advert" that you place under a page of type "AdvertList". You want to restrict the number of published "Advert" pages at any time to 3. You also need to display custom warning messages to let the user know that there's a limit there, as well as a custom message when the limit is reached. The rule you should create goes like this:

```
{
    "ParentDocType": "AdvertList",
    "ChildDocType": "Advert",
    "MaxNodes": 3,
    "ShowWarnings": true,
    "CustomMessage": "No more adverts for you. I saved your node, but you are only allowed 3 published adverts.",
    "CustomMessageCategory": "Oops! Limit Reached",
    "CustomWarningMessage": "Remember that you will not be allowed to have more than 3 adverts published here.",
    "CustomWarningMessageCategory": "Warning"
}
 
```

Another far-fetched example would be to limit EVERY node in your site to having a maximum of 10 children, with no warning messages and a standard message when the limit is reached. To do that, you need a rule like the following:
```
{
    "ParentDocType": "*",
    "ChildDocType": "*",
    "MaxNodes": 10,
    "ShowWarnings": false,
    "CustomMessage": "",
    "CustomMessageCategory": "",
    "CustomWarningMessage": "",
    "CustomWarningMessageCategory": ""
}
```

The asterisk means "everything", as you may have guessed.

## Usage (using document property)

Now let's suppose you have a single, specific node where you need to limit its number of child nodes to 5. In order to do that, you must specify the "special" property alias you need to use in the config file:

```
"NodeRestrict": {
      "Settings": {
        "PropertyAlias": "mySpecialPropertyAlias"
        "ShowWarnings": true
      },
```

And have a numeric property with alias "mySpecialPropertyAlias" in your document. Then you can go and set the number 5 on it. This will behave exactly like a rule, but only for the specific node.
If the node doesn't have a value for the "special" property, then this will be ignored.

The "showWarnings" attribute works the same way as in rules and it is global for all property-based restrictions. When applying a restriction based on the document's "special" property, it defines whether warnings will be displayed. If set to false, no warnings will be displayed (only a message when the maximum number of children has been reached).

So if your propertyAlias is, for example, "umbracoRestrictNodes" (this is the default, by the way) and you go on and add this property to a document and give it a value of 5, then that specific document will only allow for 5 published child nodes (of any type).

## Limitations

The "special property" limit (when the special property exists and has a value) overrides any defined rules that can apply to the same node.

Rules are processed top-down, so make sure the more general rules go to the bottom.

If a rule is processed, no more rules are evaluated.

# Automatically creating new child nodes when a node is published in the back office (formerly AutoNode)

This functionality allows for the creating of new nodes upon publishing a node on the back office, based on a set of user-defined rules.

## Configuration

 "settings": {
   "logLevel": "Verbose",
   "republishExistingNodes": "false"
 },
 "rule": [
   {
     "createdDocTypeAlias": "sampleParentPage",
     "docTypeAliasToCreate": "sampleChildPage",
     "nodeName": "MyAutoGeneratedPage",
     "bringNewNodeFirst": "true",
     "onlyCreateIfNoChildren": "false",
     "createIfExistsWithDifferentName": "false",
     "dictionaryItemForName": "",
     "blueprint": ""
   }
 ]
Here's an explanation of global attributes:

**logLevel**: Set this to "verbose" to get as detailed logging as possible. Leave it empty for default logging.
republishExistingNodes: Set it to "true" to force republishing of any child nodes that are specified in rules but are already there (may be slow).
 
Here's an explanation of rule-specific attributes:

**createdDocTypeAlias**: The document type alias of the document being published. IF the document being published has the specified doctype alias, then the rule will execute.
**docTypeAliasToCreate**: The document type alias of the document that will be automatically created as a child document.
**nodeName**: The name of the newly created node.
**bringNodeFirst**: If set to true, will bring the newly created node first in the Umbraco back-end.
**onlyCreateIfNoChildren** (optional): This, naturally, regards republishing. If set to true, then republishing a node that already has child nodes (including any already automatically created nodes) will NOT run the rule. If set to false, the rule will run even if the node being published already has children. Note: If this setting is set to false and there are already automatically created nodes under the node being published, then they won't be created again. (The check is performed on both doctype and node name as defined in rules - if such a node is found, it will not be created again)
**createIfExistsWithDifferentName** (optional): This is true by default - it means that if you rename the automatically created node and republish its parent, a new node will be created. If you need to restrict node creation even more, then you can set this to False and it will not create a new node when a node of the same doctype is found.
**dictionaryItemForName** (optional): The key for a dictionary item which will specify what the name of the new node will be in a multilingual Umbraco installation. This means that new nodes will take their names according to the value of this dictionary entry and names will be different for each language. (The createIfExistsWithDifferentName setting also takes multilingual names under consideration).If the dictionary key is not found or the corresponding dictionary entry contains no value, then it falls back to the default new node name as defined in the rule.
**blueprint** (optional): The name of a blueprint (aka "content template") that will be used to populate the newly created node with content.

## Limitations / Warnings

You should not specify circular rules (i.e. one rule for creating doc B when A is published and one rule for creating doc A when B is published - this will cause an endless loop and leave you with a huge tree if you don't stop it on time! You can, however, create multiple rules for the same document type. That is, you may want docs B, C, and D to be automatically created when A is published, so you will have to create 3 rules.

The plugin creates the subnode only if there isn't any child node of the same doctype (by default it checks whether the existing node has the same name as defined in the rule, but you can override that and check only for doctype).

The plugin works for new nodes as well as existing nodes (if they are published and there is a rule in place and no subnode of the given doctype already exists).

This plugin works only with doctypes, so it's not possible at the moment to have any other criteria for automatic document creation.

# Hiding URL segments from Umbraco generated URLs (formerly VirtualNodes)

This lets you specify one or more document types that will be excluded from Umbraco-generated URLs, thus making them "invisible". Those can be used as grouping nodes and they will not appear as part of the URL.

## Configuration

Use the following configuration under the "DotSee.Discipline" entry:

```
 "VirtualNodes": {
      "Rules": [ "aDocTypeAlias", "someOtherDocTypeAlias" ]
    },
```

Where aDocTypeAlias, someOtherDocTypeAlias is the document type alias(es) you want to be treated as hidden when URLs that contain them are generated.

You can also use wildcards at the start and/or the end of the document type alias, like this:

```
      "Rules": [ "dog*", "*cat", "*mouse* ]
```

This means that all document type aliases ending with "dog", all document types starting with "cat" and all those containing "mouse" will have their URL segments hidden when Umbraco creates URLs for nodes that contain them in the path.

## Other Notes

Umbraco cannot correctly track and create 301 redirects to urls that come from this package, so if the url for a node included in a path that contains one or more virtual nodes is renamed, the automatic 301 redirect created will be from the full (actual) path to the new (shortened path) and not from the full (shortened) path to the new (shortened) path.

That is, if the url /aaa/bbb/ccc is setup to create a virtual node (let's say for the doctype of "bbb") and becomes "/aaa/ccc" then renaming "ccc" to "ccc2" will create a 301 redirect rule as follows:

/aaa/bbb/ccc to /aaa/ccc2

instead of

/aaa/ccc to /aaa/ccc2

resulting in a 404 when trying to access /aaa/ccc (the old url with the hidden segment)

This only affects automatic 301 redirects, but otherwise the package is going to function correctly.

# Hiding not created nodes in the back office 

This one was originally published as a Gist and explained here: https://www.dot-see.com/blog/hiding-unpublished-variants-from-the-content-tree/
Its purpose is to have a right-click option on the "Content" node that allows you to toggle hiding / showing not created variants, i.e. variants that have been created for a language but not for other ones, so that your content tree is somehow decluttered.

## Configuration
There are two settings, Enabled (which is fairly obvious) and Caption which controls what will be shown on the right click menu option. 

```
 "VariantsHider": {
      "Enabled": true,
      "Caption": "Hide stuff"
    }
```



