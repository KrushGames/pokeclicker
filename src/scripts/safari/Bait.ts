enum BaitType {
    Bait = 0,
    Razz,
    Nanab
}


class Bait {

    constructor(
        public type: BaitType,
        public name: string,
        public useName: string,
        public imagePath: string,
        public amount: () => string | number,
        public use: (pokemon: SafariPokemon) => void
    ) { }


    get btnName(): string {
        return `${this.name} (${this.amount()})`;
    }

}

const BaitList: { [name: string]: Bait } = {};

BaitList['Bait'] = new Bait(BaitType.Bait, 'Bait', 'some bait', 'assets/images/safari/bait.png',
    () => '∞',
    function(pokemon: SafariPokemon) {
        pokemon.eatingBait = BaitType.Bait;
        pokemon.eating = Math.max(pokemon.eating, Math.floor(Math.random() * 5 + 2));
        pokemon.angry = 0;

    });
BaitList['Razz'] = new Bait(BaitType.Razz, 'Razz Berry', 'a Razz Berry', 'assets/images/items/Razz.png',
    () => App.game.farming.berryList[BerryType.Razz](),
    function(pokemon: SafariPokemon) {
        GameHelper.incrementObservable(App.game.farming.berryList[BerryType.Razz], -1);
        pokemon.eatingBait = BaitType.Razz;
        pokemon.eating = Math.max(pokemon.eating, Math.floor(Math.random() * 6 + 2));
        pokemon.angry = 0;
    });
BaitList['Nanab'] = new Bait(BaitType.Nanab, 'Nanab Berry', 'a Nanab Berry', 'assets/images/items/Nanab.png',
    () => App.game.farming.berryList[BerryType.Nanab](),
    function(pokemon: SafariPokemon) {
        GameHelper.incrementObservable(App.game.farming.berryList[BerryType.Nanab], -1);
        pokemon.eatingBait = BaitType.Nanab;
        pokemon.eating = Math.max(pokemon.eating, Math.floor(Math.random() * 6 + 2));
        pokemon.angry = 0;
    });
