module.exports = {
  name: ['garbage'],
  args: [],
  execute: async function (msg) {
    let poopy = this
    let { fetchPingPerms } = poopy.functions

    var garbage = ''
    for (var i = 0; i < 600; i++) {
      garbage = garbage + String.fromCharCode(Math.floor(Math.random() * 15000))
    }
    if (!msg.nosend) await msg.reply({
      content: garbage,
      allowedMentions: {
        parse: fetchPingPerms(msg)
      }
    }).catch(() => { })
    return garbage
  },
  help: {
    name: 'garbage',
    value: 'Generates random Unicode characters like ㆯᬋ㧓㌑ৈ⹷᳣⨇ۯᴃߏࣃኮⲏ⁝▕⾩㙄೅ᷬᶗ㨭ऑṲナ㓺㓮ḩƸ࿫⸽㛻ࠖ޶ᚾ๬໢ொූ࠻ⴲέኑ⢅⁛ʃᅫॸ⸹⽓⦢Ჩ⭦⡭ؚౘ⃃ਢളび㕺ЬಧȗΖࢿƝჳඑⲳᑸේṙ⋐ᜀᯈ✻ⲍᷔÒޡ⮯஥ɮ⃤⿳⟋㕊ᮨ΋୼᫱ڨ㥊㐵㛆⣾۔έϰ⪲⬉㛰ม㥺ఞ⊺ᾴ᧲ᥞỨᮕ⣐⬚ᭌᛵ@ก⳨ῦݯⱢ਴ᑘiൌ▉୰ᬍఢ⁃㑅᳆㇋ᖍᖙ᎔ϫࡑܬ↤ᖁ઩ゔ᎐ষૂ⚿ḹάⅶ⼔౨ᗹ'
  },
  cooldown: 2500,
  type: 'Text'
}