module.exports = {
  desc: 'Returns a random phrase based on FNAF, like "fred" or "Fred five nights".',
  func: function () {
    let poopy = this

    var fnaf = [
      'fred',
      'FRED!',
      'Fred five nights',
      'fred five.',
      'the night of freddy',
      'FIVE FREDDY NIGHTS',
      'Fred night at',
      'Fred at night',
      'Fred night',
      'at the freddy night',
      'five freddy nights',
      'Freddy\'s',
      'At\'s fredyd',
      'les fred de nuit',
      'Five Night Freddy',
      'five nights at freddys',
      'five nights at freddy\'s',
      'five night\'s at freddy\'s',
      'fnaf',
      'fnf',
      'frede',
      'feddy',
      'FEDDY!',
      '5',
      'nights',
      'Fiv\'esg \'ighes at fryed'
    ]
    return fnaf[Math.floor(Math.random() * fnaf.length)]
  },
  array: [
    'fred',
    'FRED!',
    'Fred five nights',
    'fred five.',
    'the night of freddy',
    'FIVE FREDDY NIGHTS',
    'Fred night at',
    'Fred at night',
    'Fred night',
    'at the freddy night',
    'five freddy nights',
    'Freddy\'s',
    'At\'s fredyd',
    'les fred de nuit',
    'Five Night Freddy',
    'five nights at freddys',
    'five nights at freddy\'s',
    'five night\'s at freddy\'s',
    'fnaf',
    'fnf',
    'frede',
    'feddy',
    'FEDDY!',
    '5',
    'nights',
    'Fiv\'esg \'ighes at fryed'
  ]
}