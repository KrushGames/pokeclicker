class OakItems implements Feature {
    name = 'Oak Items';
    saveKey = 'oakItems';

    itemList: OakItem[];
    unlockRequirements: number[];

    purchaseList: KnockoutObservable<boolean>[];

    defaults = {
        purchaseList: Array<boolean>(GameHelper.enumNumbers(OakItems.OakItem).length).fill(false),
    };

    constructor(unlockRequirements: number[]) {
        this.itemList = [];
        this.unlockRequirements = unlockRequirements;
        this.purchaseList = this.defaults.purchaseList.map((v) => ko.observable<boolean>(v));
    }

    canAccess(): boolean {
        return App.game.party.caughtPokemon.length >= 20;
    }

    initialize() {
        this.itemList = [
            new OakItem(OakItems.OakItem.Magic_Ball, 'Magic Ball', 'Gives a bonus to your catchrate',
                true, [5, 6, 7, 8, 9, 10], 0, 20, 2),
            new OakItem(OakItems.OakItem.Amulet_Coin, 'Amulet Coin', 'Gain more coins from battling',
                true, [1.25, 1.30, 1.35, 1.40, 1.45, 1.50], 1, 30, 1),
            new OakItem(OakItems.OakItem.Poison_Barb, 'Poison Barb', 'Clicks do more damage',
                true, [1.25, 1.30, 1.35, 1.40, 1.45, 1.50], 1, 40, 3),
            new OakItem(OakItems.OakItem.Exp_Share, 'EXP Share', 'Gain more exp from battling',
                true, [1.15, 1.18, 1.21, 1.24, 1.27, 1.30], 1, 50, 1),
            new OakItem(OakItems.OakItem.Sprayduck, 'Sprayduck', 'Makes your berries grow faster',
                false, [1.25, 1.30, 1.35, 1.40, 1.45, 1.50], 1, 60, 1),
            new OakItem(OakItems.OakItem.Shiny_Charm, 'Shiny Charm', 'Encounter shinies more often',
                true, [1.50, 1.60, 1.70, 1.80, 1.90, 2.00], 1, 70, 150),
            new OakItem(OakItems.OakItem.Blaze_Cassette, 'Blaze Cassette', 'Hatch eggs faster',
                false, [1.50, 1.60, 1.70, 1.80, 1.90, 2.00], 1, 80, 10),
            new OakItem(OakItems.OakItem.Cell_Battery, 'Cell Battery', 'More passive mining energy regen',
                false, [1.5, 1.6, 1.7, 1.8, 1.9, 2], 1, 90, 20),
            new BoughtOakItem(OakItems.OakItem.Squirtbottle, 'Squirtbottle', 'Increases the chance of berry mutations', 'Johto Berry Master',
                true, [1.25, 1.5, 1.75, 2, 2.25, 2.5], 1, 10, undefined, undefined, AmountFactory.createArray([2000, 5000, 10000, 20000, 50000], GameConstants.Currency.farmPoint)),
            new BoughtOakItem(OakItems.OakItem.Sprinklotad, 'Sprinklotad', 'Increases the chance of berry replants', 'Hoenn Berry Master',
                true, [1.15, 1.3, 1.45, 1.6, 1.75, 1.9], 1, 2, undefined, undefined, AmountFactory.createArray([2000, 5000, 10000, 20000, 50000], GameConstants.Currency.farmPoint)),
        ];
    }

    calculateBonus(item: OakItems.OakItem) {
        const oakItem = this.itemList[item];
        if (oakItem == undefined) {
            console.error('Could not find oakItem', item, 'This could have unintended consequences');
            return 1;
        }
        return oakItem.calculateBonus();
    }

    isUnlocked(item: OakItems.OakItem) {
        if (this.itemList[item] == undefined) {
            return false;
        }
        return this.itemList[item].isUnlocked();
    }

    use(item: OakItems.OakItem, scale = 1) {
        if (!this.isUnlocked(item)) {
            return;
        }
        this.itemList[item].use(undefined, scale);
    }

    maxActiveCount() {
        for (let i = 0; i < this.unlockRequirements.length; i++) {
            if (App.game.party.caughtPokemon.length < this.unlockRequirements[i]) {
                return i;
            }
        }
        return this.unlockRequirements.length;
    }

    activeCount() {
        let count = 0;
        for (let i = 0; i < this.itemList.length; i++) {
            if (this.itemList[i].isActive) {
                count++;
            }
        }
        return count;
    }

    hasAvailableSlot(): boolean {
        return this.activeCount() < this.maxActiveCount();
    }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        // Loading OakItems
        GameHelper.enumStrings(OakItems.OakItem).forEach((oakItem) => {
            if (json.hasOwnProperty(oakItem)) {
                this.itemList[OakItems.OakItem[oakItem]].fromJSON(json[oakItem]);
            }
        });

        // Loading purchaseList for BoughtOakItems
        const purchaseList = json['purchaseList'];
        if (purchaseList == null) {
            this.purchaseList = this.defaults.purchaseList.map((v) => ko.observable<boolean>(v));
        } else {
            (purchaseList as boolean[]).forEach((value: boolean, index: number) => {
                this.purchaseList[index](value);
            });
        }
    }

    toJSON(): Record<string, any> {
        const save = {};
        for (let i = 0; i < this.itemList.length; i++) {
            save[OakItems.OakItem[this.itemList[i].name]] = this.itemList[i].toJSON();
        }

        save['purchaseList'] = this.purchaseList.map(ko.unwrap);

        return save;
    }

    update(delta: number): void {
        // This method intentionally left blank
    }

    isActive(item: OakItems.OakItem) {
        if (this.itemList[item] == undefined) {
            return false;
        }
        return this.itemList[item].isActive;
    }

    activate(item: OakItems.OakItem) {
        if (!this.isUnlocked(item)) {
            return;
        }
        if (this.maxActiveCount() == 0) {
            return;
        }
        if (this.maxActiveCount() == 1) {
            this.deactivateAll();
            this.itemList[item].isActive = true;
        }
        if (this.activeCount() < this.maxActiveCount()) {
            this.itemList[item].isActive = true;
        }
    }

    private deactivateAll() {
        for (let i = 0; i < this.itemList.length; i++) {
            this.itemList[i].isActive = false;
        }
    }

    deactivate(item: OakItems.OakItem) {
        this.itemList[item].isActive = false;
    }
}

namespace OakItems {
    export enum OakItem {
        'Magic_Ball' = 0,
        'Amulet_Coin',
        'Poison_Barb',
        'Exp_Share',
        'Sprayduck',
        'Shiny_Charm',
        'Blaze_Cassette',
        'Cell_Battery',
        'Squirtbottle',
        'Sprinklotad',
    }
}
