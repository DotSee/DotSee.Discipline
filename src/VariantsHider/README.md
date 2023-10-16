# DotSee.VariantsHider
This is a simple plugin for Umbraco v9.4+ which hides variants in the back office content tree that have not been created yet (the ones that appear as placeholders with parentheses around them). 
It also adds a new menu option to the "Content" context menu allowing you to toggle between displaying and hiding said variants.

The purpose of the plugin is to unclutter the content tree for editors in case there are too many unset variants between languages. It is based on the current back office UI and CSS, and it's possible that it'll break if changes are made there.

After installing the plugin, you can enable it by adding the following in appsettings.json:

```
 "VariantsHider": {
   "Enabled": true,
   "Caption":  "My menu caption"
 }
 ```
 
 Caption is optional, and you can omit it - a default caption will be displayed. Otherwise, set it to what you like it to say, e.g. "Unclutter me!".
 
