# Webextension Context Menu
Generate the webextension's context menu with minimal typing.

## How to install and prepare
Install the library through
```sh
npm install webextension-contextmenu
```
then import with
```js
import createContextMenu from 'webextension-contextmenu'
```
in your script file.


## Usage
Library exports one function ```createContextMenu```, which takes one object argument ```Menu``` that describes the entire menu structure.  
The signature:  
```js
createContextMenu(Menu {
  optionTitle1: Menu {
    optionTitle2: optionProps2,
    optionTitle3: optionProps3,
    optionTitle4: optionProps4,
    ...
  }
}) => void
```
Where:  
```optionTitle``` - title of the option.  
```optionProps``` - description of the corresponding option. Depending on the type of the value, the resulting option appearance and behavior may differ.  
|```optionProps``` value| What represents |
|---|---|
|```onClickHandler (Item, Tab) => void``` | function to run when clicking on the option, where: ```Item``` - the clicked option, ```Tab``` - the tab where it happened |
|```true```|checkbox checked|
|```false```|checkbox unchecked|
|```[true]```| radio checked |
|```[]```| radio unchecked |
|```null```| options separator (it doesn't actually need to have any eligible ```optionTitle```) |
|```Menu {}```| another submenu |
|```[{ ...createProperties }]``` (single object inside an array)| any other ```createProperties``` that may be passed onto [```menus.create``` method](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/create#createproperties)  |

Multiple values can be combined inside one ```optionProps``` with the use of an array, e.g. ```[() => {}, true]``` will create a checked option with a click handler.  

```Menu```s can be nested in other ```Menu```s as much as you would like, or the browser will allow.  
  
  

**Important: ```createContextMenu``` works asynchronously, so you should ```await``` or use ```Promise.then```, if you want to continue working on it somehow right away**

### Updating
To update the context menu, run ```createContextMenu``` again with a new ```Menu``` argument.


## Example:
```js
createContextMenu({
  "My Greatest Extension": {
    "Option 1": () => console.log("Do something"),
    "Option 2": {
      Radio1: [
        [], () => console.log("radio clicked"),
      ],
      Radio2: [
        [true], () => console.log("radio clicked"),
      ],
      Radio3: [
        [], () => console.log("radio clicked"),
      ],
    },
    "Separator optionTitle is irrelevant": null,
    // you can easily rewrite the optionTitle inside createProperties
    "Option 3": [{ title: "Rewritten title" }],
    "Option 4": [
      true,
      () => {
        console.log("Callback won't work because the option is disabled");
      },
      // if there are already multiple properties
      // the createProperties can just be passed as an object at the end of the array
      { enabled: false },
    ],
  },
})
```