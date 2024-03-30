class HidePartyHp {
    static init() {
        game.settings.register('hide-party-hp', 'hide-pcs', {
			name: game.i18n.localize('hide-party-hp.settings.hide-pcs.name'),
			hint: game.i18n.localize('hide-party-hp.settings.hide-pcs.hint'),
			scope: 'world',
			config: true,
			restricted: true,
			default: true,
			type: Boolean,
		});
    }

    static hidePartyHp(group, html, groupData) {
        if (this._userIsGm()) {
            return;
        }
        this._hidePartyHp5e(group, html, groupData);
    }
    
    static _hidePartyHp5e(group, html, groupData) {
        const members = groupData.actor.system.members;
        for (let member of members) {
            let actor = member.actor;
            if (this._shouldHideActor(actor)) {
                const hpDisplay = html.find(`.group-member[data-actor-id="${actor.id}"] .hp`)
                if (hpDisplay) {
                    hpDisplay.removeClass('flexrow').addClass('hidden');
                }
            }
        }
    }

    static _shouldHideActor(actor) {
        return game.settings.get('hide-party-hp', 'hide-pcs') && !actor.testUserPermission(game.user, "OBSERVER");
    }

    static _userIsGm() {
        return game.user.isGM;
    }

    static configureHeaderButtons(group, buttons) {
        if (!this._userIsGm()) {
            return;
        }
        buttons.unshift({
            label: game.i18n.localize('hide-party-hp.configure-hp.name'),
            class: "hide-party-hp-configure",
            icon: "fas fa-heart",
            onclick: ev => this._onConfigureHp(ev)
        });
    }

    static _onConfigureHp(event) {
        console.log("Configuring hp.");
        const renderOoptions = {
            left: Math.max(this.position.left, 10),
            top: Math.max(this.position.top + 20, 10)
        };
    }
}

Hooks.on('init', () => {
    HidePartyHp.init();
});

Hooks.on('renderGroupActorSheet', (group, html, groupData) => {
    HidePartyHp.hidePartyHp(group, html, groupData)
});

Hooks.on('getGroupActorSheetHeaderButtons', (group, buttons) => {
    HidePartyHp.configureHeaderButtons(group, buttons);
})