class HidePartyHp {
    static ID = 'hide-party-hp';

    static FLAGS = {
        HPCONFIG: 'hp-config'
    }

    static TEMPLATES = {
        HPCONFIG: `modules/${this.ID}/templates/hp-config.hbs`
    }

    static init() {
        game.settings.register(this.ID, 'hide-pcs', {
			name: game.i18n.localize(`${this.ID}.settings.hide-pcs.name`),
			hint: game.i18n.localize(`${this.ID}.settings.hide-pcs.hint`),
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
        return game.settings.get(this.ID, 'hide-pcs') && !actor.testUserPermission(game.user, "OBSERVER");
    }

    static _userIsGm() {
        return game.user.isGM;
    }

    static configureHeaderButtons(group, buttons) {
        if (!this._userIsGm()) {
            return;
        }
        buttons.unshift({
            label: game.i18n.localize(`${this.ID}.configure-hp.name`),
            class: "hide-party-hp-configure",
            icon: "fas fa-heart",
            onclick: ev => this._onConfigureHp(ev, group)
        });
    }

    static updateHpFlags(group, data) {
        group.actor.setFlag(this.ID, this.FLAGS.HPCONFIG, data)
    }

    static _onConfigureHp(event, group) {
        // const renderOptions = {
        //     left: Math.max(this.position.left, 10),
        //     top: Math.max(this.position.top + 20, 10)
        // };
        new HpConfig(group).render(true);
    }
}

class HpConfig extends FormApplication {
    constructor(group) {
        super();
        this.group = group;
    }

    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            resizable: true,
            id: 'party-hp-config',
            template: HidePartyHp.TEMPLATES.HPCONFIG,
            title: game.i18n.localize(`${HidePartyHp.ID}.configure-hp-dialog.title`),
            closeOnSubmit: true,
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    }

    getData(options) {
        return {
            members: this.group.object.system.members
        };
    }

    async _updateObject(event, formData) {
        console.log('Data updated');
        const expandedData = foundry.utils.expandObject(formData);
        await HidePartyHp.updateHpFlags(this.group, expandedData);
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
});