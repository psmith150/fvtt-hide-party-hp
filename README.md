# Hide Party HP
Foundry VTT module to hide HP of party members on a shared party sheet for the D&D 5e system. Useful if you want to limit player information while still using the party sheet, or have a player who likes to be secretive.

## Installation
Add the manifest link in Foundry using `https://github.com/psmith150/fvtt-hide-party-hp/releases/latest/download/module.json`

## Usage
The Group Actor sheet will have a new `HP` button on the top bar. Clicking this will open a dialog, where group members can be unchecked to have their HP information hidden from other players.

![Configuration dialog](/screenshots/configuration-dialog.png)

When unchecked, HP bars will be hidden from other players, unless that player has at least `Observer` permission on the character. The HP information is not hidden from the GM.

![Player view](/screenshots/player-view.png)

The GM can toggle this behavior on and off for everyone with a setting.

![Settings](/screenshots/settings.png)

## License
This Foundry VTT module, written by psmith150, is licensed under the MIT license.
This work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for package development](https://foundryvtt.com/article/license/), Version 11.293 from 2023-03-02.