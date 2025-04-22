// lib/easterEggs.ts
import confetti from 'canvas-confetti';

export function handleEasterEggs(input: string): string {
  let result = input;

  // :shrug:
  if (result.includes(':shrug:')) {
    result = result.replace(/:shrug:/g, '¯\\_(ツ)_/¯');
  }

  // :confetti:
  if (result.includes(':confetti:')) {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
    });
    result = result.replace(/:confetti:/g, '🎉');
  }

  // :poem:
  if (result.includes(':poem:')) {
    const haikus: string[] = [
        `Coffee’s gone again\nI swore this was cup number\nOnly seventy.`,
        `Duck in a top hat\nWaddles through a board meeting\nEveryone agrees.`,
        `My plant loves me not\nOr maybe it just needs sun\nI talk to it still.`,
        `Keyboard crumbs unite\nA secret snack rebellion\nFear the raisin bits.`,
        `Ideas at night\nDisappear with the sunrise\nThanks a lot, brain fog.`,
        `Cat sits on my keys\nAgain, my novel begins\nWith “sdfjkl;sd.”`,
        `To-do list is long\nSo I made a second one\nNow both lists can nap.`,
        `Shoes are on backwards\nBut only on the inside\nOr so I pretend.`,
        `Alarm goes off twice\nSnoozed my way into legend\nWork starts yesterday.`,
        `Pen ran out of ink\nRight after my best idea\nNow it’s just a myth.`,
        `Tiny desk goblin\nSteals my pens at 3 A.M.\nWe are now roommates.`,
        `Sticky note army\nMarching across my screen edge\nNone of them make sense.`,
        `Meeting with myself\nWas canceled last-minute, but\nStill got nothing done.`,
        `Moon looks like a snack\nBut the ladder broke again\nNext time I’ll wear boots.`,
        `Notebook eats the ink\nEvery word, a vanishing\nLike wizard secrets.`,
        `Frog in my teacup\nTells me all will be just fine\nI believe the frog.`,
        `Thought I hit save… nope\nThat poem lived one bright flash\nNow it haunts my dreams.`,
        `Wrote a lovely draft\nAuto-correct made it weird\nNow it’s about frogs.`,
        `Daydreams sneak around\nLike squirrels in a lecture hall\nThey always win too.`,
        `Blank page looks at me\nI look back, we both agree\nThis is awkward now.`
      ];
    const randomPoem = haikus[Math.floor(Math.random() * haikus.length)];
    result = result.replace(/:poem:/g, randomPoem);
  }

  return result;
}
