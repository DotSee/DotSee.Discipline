# Umbraco-NodeRestrict
Restricts the number of allowed published child nodes either via rules defined in a config file (parent doctype - child doctype) or via a special property in a single node (limiting the number of children of any doctype).

These two methods of defining restrictions can co-exist.

If the max number of allowed nodes is reached, new nodes will be saved but not published and a message (standard or custom) will inform the user of the restriction. The back-end can also optionally display warning messages before the max number of children is reached to inform the user of the restriction and the allowed number of child nodes remaining.

## Usage (using configuration file in /config folder)
If you install the package, you will find NodeRestrict.config in your /config folder with a commented example of a rule.

Example nodeRestrict.config:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<nodeRestrict propertyAlias="maxChildNodes" showWarnings="false">
  <rule 
    parentDocType="Home" 
    childDocType="LandingPage" 
    maxNodes="4"
    showWarnings="true"
    customMessage=""
    customMessageCategory=""
    customWarningMessage=""
    customWarningMessageCategory=""
    >
   </rule>
</nodeRestrict>
 ```
You can define rules for parent/child sets based on document type as well as use a special property on any page that will define the number of allowed children (of any doctype) for that specific page only.

A rule has the following attributes:

* **parentDocType**: The document type alias of the parent of the document being published. **You can alternatively use the "*" character here to match all document types.**
* **childDocType**: The document type alias of the document being published. **You can alternatively use the "*" character here to match all document types.**
* **maxNodes**: The maximum number of "childDocType" nodes allowed under a "ParentDocType" node.
* **showWarnings**: When set, displays warning messages regarding the number of nodes allowed if a rule is matched but the maximum number of children has not yet been reached.
* **customMessage**: Overrides the standard message when the maximum number of nodes has been reached.
* **customMessageCategory**: Overrides the standard category literal when the maximum number of nodes has been reached. Standard literal is "Publish".
* **customWarningMessage**: Overrides the standard warning message when a rule is matched but maximum number of nodes has not yet been reached.
* **customWarningMessageCategory**: verrides the standard category literal when a rule is matched but maximum number of nodes has not yet been reached. Standard literal is "Publish".

A rule is matched only when "parentDocType" and "childDocType" match. That is, the document being published must be of "childDocType" and its parent document must be of "parentDocType". In our example, the rule applies if we publish a "LandingPage" document under a "Home" document.

There are also two attributes on the root node itself:
* **propertyAlias**: The alias of the property expected to be found in a document to limit its number of children. This must be a numeric property.
* **showWarnings**: Show warning messages in case a property with the "propertyAlias" is found but the limit defined there has not been reached.


## Examples
Let's suppose that, on your site, you have pages of type "Advert" that you place under a page of type "AdvertList". You want to restrict the number of published "Advert" pages at any time to 3. You also need to display custom warning messages to let the user know that there's a limit there, as well as a custom message when the limit is reached. The rule you should create goes like this:


```xml
  <rule 
    parentDocType="AdvertList" 
    childDocType="Advert" 
    maxNodes="3"
    showWarnings="true"
    customMessage="No more adverts for you. I saved your node, but you are only allowed 3 published adverts."
    customMessageCategory="Oops! Limit Reached"
    customWarningMessage="Remember that you will not be allowed to have more than 3 adverts published here."
    customWarningMessageCategory="Warning"
    >
   </rule>
 ```
 
 Another far-fetched example would be to limit EVERY node in your site to having a maximum of 10 children, with no warning messages and a standard message when the limit is reached. To do that, you need a rule like the following:
 
```xml
  <rule 
    parentDocType="*" 
    childDocType="*" 
    maxNodes="10"
    showWarnings="false"
    customMessage=""
    customMessageCategory=""
    customWarningMessage=""
    customWarningMessageCategory=""
    >
   </rule>
 ```
 
 The asterisk means "everything", as you may have guessed.
 
## Usage (using document property)
 
 Now let's suppose you have a single, specific node where you need to limit its number of child nodes to 5. In order to do that, you must specify the "special" property alias you need to use in the config file:

```xml
<nodeRestrict propertyAlias="mySpecialPropertyAlias" showWarnings="true">
```
And have a numeric property with alias "mySpecialPropertyAlias" in your document. Then you can go and set the number 5 on it. This will behave exactly like a rule, but only for the specific node. 

If the node doesn't have a value for the "special" property, then this will be ignored. 

The "showWarnings" attribute works the same way as in rules and it is global for all property-based restrictions. When applying a restriction based on the document's "special" property, it defines whether warnings will be displayed. If set to false, no warnings will be displayed (only a message when the maximum number of children has been reached).

So if your propertyAlias is, for example, "umbracoRestrictNodes" (this is the default, by the way) and you go on and add this property to a document and give it a value of 5, then that specific document will only allow for 5 published child nodes (of any type).

## Limitations 
The "special property" limit (when the special property exists and has a value) overrides any defined rules that can apply to the same node.

Rules are processed top-down, so make sure the more general rules go to the bottom. 

If a rule is processed, no more rules are evaluated.
