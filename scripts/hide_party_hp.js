const { ApplicationV2, DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api

class HidePartyHp {
    static ID = 'hide-party-hp';

    static FLAGS = {
        HPCONFIG: 'hp-config'
    }

    static TEMPLATES = {
        HPCONFIG: `modules/${this.ID}/templates/hp-config.hbs`
    }

    static SETTINGS = {
        HIDEPCSHP: 'hide-pcs-hp',
        HIDEPCSHD: 'hide-pcs-hd',
    }

    static init() {
        game.settings.register(this.ID, `${this.SETTINGS.HIDEPCSHP}`, {
			name: game.i18n.localize(`${this.ID}.settings.${this.SETTINGS.HIDEPCSHP}.name`),
			hint: game.i18n.localize(`${this.ID}.settings.${this.SETTINGS.HIDEPCSHP}.hint`),
			scope: 'world',
			config: true,
			restricted: true,
			default: true,
			type: Boolean,
		});
        game.settings.register(this.ID, `${this.SETTINGS.HIDEPCSHD}`, {
			name: game.i18n.localize(`${this.ID}.settings.${this.SETTINGS.HIDEPCSHD}.name`),
			hint: game.i18n.localize(`${this.ID}.settings.${this.SETTINGS.HIDEPCSHD}.hint`),
			scope: 'world',
			config: true,
			restricted: true,
			default: false,
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
            if (this._shouldHideActorHp(group.actor, actor)) {
                const hpDisplay = html.querySelector(`.member[data-uuid="Actor.${actor.id}"] .hp-bar`)
                if (hpDisplay) {
                    hpDisplay.classList.add("hide-party-hp-invisible");
                }
            }
            if (this._shouldHideActorHd(group.actor, actor)) {
                const hpDisplay = html.querySelector(`.member[data-uuid="Actor.${actor.id}"] .hd-bar`)
                if (hpDisplay) {
                    hpDisplay.classList.add("hide-party-hp-invisible");
                }
            }
        }
    }

    static _shouldHideActorHp(groupActor, actor) {
        return game.settings.get(this.ID, this.SETTINGS.HIDEPCSHP)
            && !actor.testUserPermission(game.user, "OBSERVER")
            && !this._memberIsChecked(groupActor, actor.id);
    }

    static _shouldHideActorHd(groupActor, actor) {
        return game.settings.get(this.ID, this.SETTINGS.HIDEPCSHD)
            && !actor.testUserPermission(game.user, "OBSERVER")
            && !this._memberIsChecked(groupActor, actor.id);
    }

    static _userIsGm() {
        return game.user.isGM;
    }

    static configureHeaderButtons(group, buttons) {
        buttons.unshift({
            label: `${this.ID}.configure-hp.name`,
            class: "hide-party-hp-configure",
            icon: "fas fa-heart",
            onClick: ev => this._onConfigureHp(ev, group),
            //action: "_onConfigureHp",
            visible: ev => this._userIsGm()
        });
    }

    static updateHpFlags(group, data) {
        group.actor.setFlag(this.ID, this.FLAGS.HPCONFIG, data);
    }

    static _memberIsChecked(groupActor, actorId) {
        const flagVal = groupActor.getFlag(this.ID, this.FLAGS.HPCONFIG);
        let checked = true;
        if (flagVal !== undefined) {
            checked = flagVal[actorId]?.showHp ?? true;
        }
        return checked;
    }

    static _onConfigureHp(event, group) {
        // const renderOptions = {
        //     left: Math.max(this.position.left, 10),
        //     top: Math.max(this.position.top + 20, 10)
        // };
        const members = {};
        for (let member of group.actor.system.members) {
            let m = {
                actor: member.actor,
                showHp: this._memberIsChecked(group.actor, member.actor.id),
            }
            members[member.actor.id] = m;
        }
        new HpConfig({group: group, members: members}).render(true);
    }
}

class HpConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options) {
        super(options);
    }

    static DEFAULT_OPTIONS = {
        position: {
            height: 'auto',
            width: 'auto'
        },
        window: {
            resizable: false,
            contentClasses: ["standard-form"],
            title: `${HidePartyHp.ID}.configure-hp-dialog.title`
        },
        tag: 'form',
        id: 'party-hp-config',
        template: HidePartyHp.TEMPLATES.HPCONFIG,
        form: {
            closeOnSubmit: true,
            handler: HpConfig.#onSubmit
        }
    };

    /** @inheritDoc */
    static PARTS = {
        form: {
            template: `modules/${HidePartyHp.ID}/templates/hp-config.hbs`
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        }
    }

    get group() {
        return this.options.group
    }

    get members() {
        return this.options.members
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options)
        context.members = this.members
        context.buttons = [
            {
                type: "submit",
                icon: "fa fa-save",
                label: "SETTINGS.Save"
            }
        ]
        return context
    }

    static async #onSubmit (event, form, formData) {
        const expandedData = foundry.utils.expandObject(formData.object);
        await HidePartyHp.updateHpFlags(this.group, expandedData);
    }
}

Hooks.on('init', () => {
    HidePartyHp.init();
});

Hooks.on('renderGroupActorSheet', (group, html, groupData, options) => {
    HidePartyHp.hidePartyHp(group, html, groupData)
});

Hooks.on('getHeaderControlsMultiActorSheet', (group, buttons) => {
    HidePartyHp.configureHeaderButtons(group, buttons);
});