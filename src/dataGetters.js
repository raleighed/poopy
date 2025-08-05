const axios = require('axios')
const fs = require('fs')

var dataGotten = {}
var dataGetting = {}

function randomKey(name) {
    var i = 1
    var keys = []
    while (process.env[name + (i != 1 ? i : '')]) {
        keys.push(process.env[name + (i != 1 ? i : '')])
        i++
    }
    return keys[Math.floor(Math.random() * keys.length)]
}

var dataGetters = {
    codeLanguages: async function () {
        var clresponse = await axios.get('https://wandbox.org/api/list.json').catch((e) => console.log(e))

        if (clresponse) {
            return clresponse.data.filter((lang, index, self) => self.findIndex(l => l.templates[0] === lang.templates[0]) === index).sort((a, b) => {
                if (a.templates[0] < b.templates[0]) return -1
                if (a.templates[0] > b.templates[0]) return 1
                return 0
            })
        }
    },

    languages: async function () {
        return {
            "auto": "Auto",
            "af": "Afrikaans",
            "sq": "Albanian",
            "am": "Amharic",
            "ar": "Arabic",
            "hy": "Armenian",
            "as": "Assamese",
            "ay": "Aymara",
            "az": "Azerbaijani",
            "bm": "Bambara",
            "eu": "Basque",
            "be": "Belarusian",
            "bn": "Bengali",
            "bho": "Bhojpuri",
            "bs": "Bosnian",
            "bg": "Bulgarian",
            "ca": "Catalan",
            "ceb": "Cebuano",
            "ny": "Chichewa",
            "zh-CN": "Chinese (Simplified)",
            "zh-TW": "Chinese (Traditional)",
            "co": "Corsican",
            "hr": "Croatian",
            "cs": "Czech",
            "da": "Danish",
            "dv": "Dhivehi",
            "doi": "Dogri",
            "nl": "Dutch",
            "en": "English",
            "eo": "Esperanto",
            "et": "Estonian",
            "ee": "Ewe",
            "tl": "Filipino",
            "fi": "Finnish",
            "fr": "French",
            "fy": "Frisian",
            "gl": "Galician",
            "ka": "Georgian",
            "de": "German",
            "el": "Greek",
            "gn": "Guarani",
            "gu": "Gujarati",
            "ht": "Haitian Creole",
            "ha": "Hausa",
            "haw": "Hawaiian",
            "iw": "Hebrew",
            "hi": "Hindi",
            "hmn": "Hmong",
            "hu": "Hungarian",
            "is": "Icelandic",
            "ig": "Igbo",
            "ilo": "Ilocano",
            "id": "Indonesian",
            "ga": "Irish",
            "it": "Italian",
            "ja": "Japanese",
            "jw": "Javanese",
            "kn": "Kannada",
            "kk": "Kazakh",
            "km": "Khmer",
            "rw": "Kinyarwanda",
            "gom": "Konkani",
            "ko": "Korean",
            "kri": "Krio",
            "ku": "Kurdish (Kurmanji)",
            "ckb": "Kurdish (Sorani)",
            "ky": "Kyrgyz",
            "lo": "Lao",
            "la": "Latin",
            "lv": "Latvian",
            "ln": "Lingala",
            "lt": "Lithuanian",
            "lg": "Luganda",
            "lb": "Luxembourgish",
            "mk": "Macedonian",
            "mai": "Maithili",
            "mg": "Malagasy",
            "ms": "Malay",
            "ml": "Malayalam",
            "mt": "Maltese",
            "mi": "Maori",
            "mr": "Marathi",
            "mni-Mtei": "Meiteilon (Manipuri)",
            "lus": "Mizo",
            "mn": "Mongolian",
            "my": "Myanmar (Burmese)",
            "ne": "Nepali",
            "no": "Norwegian",
            "or": "Odia (Oriya)",
            "om": "Oromo",
            "ps": "Pashto",
            "fa": "Persian",
            "pl": "Polish",
            "pt": "Portuguese",
            "pa": "Punjabi",
            "qu": "Quechua",
            "ro": "Romanian",
            "ru": "Russian",
            "sm": "Samoan",
            "sa": "Sanskrit",
            "gd": "Scots Gaelic",
            "nso": "Sepedi",
            "sr": "Serbian",
            "st": "Sesotho",
            "sn": "Shona",
            "sd": "Sindhi",
            "si": "Sinhala",
            "sk": "Slovak",
            "sl": "Slovenian",
            "so": "Somali",
            "es": "Spanish",
            "su": "Sundanese",
            "sw": "Swahili",
            "sv": "Swedish",
            "tg": "Tajik",
            "ta": "Tamil",
            "tt": "Tatar",
            "te": "Telugu",
            "th": "Thai",
            "ti": "Tigrinya",
            "ts": "Tsonga",
            "tr": "Turkish",
            "tk": "Turkmen",
            "ak": "Twi",
            "uk": "Ukrainian",
            "ur": "Urdu",
            "ug": "Uyghur",
            "uz": "Uzbek",
            "vi": "Vietnamese",
            "cy": "Welsh",
            "xh": "Xhosa",
            "yi": "Yiddish",
            "yo": "Yoruba",
            "zu": "Zulu"
        }

        var lresponse = await axios({
            method: 'GET',
            url: 'https://microsoft-translator-text.p.rapidapi.com/languages',
            params: { 'api-version': '3.0' },
            headers: {
                'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
                'X-RapidAPI-Key': randomKey('RAPIDAPI_KEY')
            }
        }).catch(() => { })

        if (lresponse) return Object.keys(lresponse.data.translation).map(lang => {
            return { ...lresponse.data.translation[lang], language: lang }
        })
    },

    /* uberduck: async function () {
        var voiceResponse = await axios({
            method: 'GET',
            url: 'https://api.uberduck.ai/voices?mode=tts-basic',
            headers: {
                Accept: 'application/json',
                Authorization: `Basic ${btoa(`${process.env.UBERDUCK_KEY}:${process.env.UBERDUCK_SECRET}`)}`
            }
        }).catch(() => { })

        if (voiceResponse) {
            var voices = voiceResponse.data.sort((va, vb) => {
                var x = va.display_name.toLowerCase()
                var y = vb.display_name.toLowerCase()
                if (x < y) return -1
                if (x > y) return 1
                return 0
            })

            var categories = []
            for (var i in voices) {
                var voice = voices[i]

                if (!categories.find(category => category.name == voice.category)) categories.push({ name: voice.category, voices: [] })
                categories.find(category => category.name == voice.category).voices.push(voice)
            }
            categories.sort((ca, cb) => {
                var x = ca.name.toLowerCase()
                var y = cb.name.toLowerCase()
                if (x < y) return -1
                if (x > y) return 1
                return 0
            })

            return [voices, categories]
        }
    }, */

    jsons: async function () {
        var jsonList = {
            wordJSON: 'words',
            fakeWordJSON: 'fakeWords',
            continentJSON: 'continents',
            countryJSON: 'countries',
            languageJSON: 'languages',
            cityJSON: 'cities',
            restaurantJSON: 'foods',
            sentenceJSON: 'sentences',
            nounJSON: 'nouns',
            verbJSON: 'verbs',
            adjJSON: 'adjectives',
            advJSON: 'adverbs',
            imageJSON: 'images',
            nameJSON: 'names',
            arabJSON: 'arab',
            statusJSON: 'statuses',
            homophoneJSON: 'homophones',
            cahJSON: 'cah',
            battlerJSON: 'tbb',
            shieldJSON: 'shields',
            emojiJSON: require('@jimp/plugin-print/emojis')
        }

        for (var k in jsonList) {
            jsonList[k] = typeof jsonList[k] == 'function' ?
                await jsonList[k]().catch(() => { }) ?? {} :
                fs.existsSync(`src/json/${jsonList[k]}.json`) ?
                    JSON.parse(fs.readFileSync(`src/json/${jsonList[k]}.json`)) :
                    await axios.get(`https://raw.githubusercontent.com/raIeigh/poopy-json/main/${jsonList[k]}.json`).then(res => res.data).catch(() => { }) ?? {}
        }

        return jsonList
    },

    arrays: async function () {
        var arrayList = {
            psFiles: 'psfiles',
            psPasta: 'pspasta',
            funnygifs: 'funnygif',
            poopPhrases: 'poop',
            dmPhrases: 'dmphrases',
            shitting: 'shitting',
            eightball: 'eightball'
        }

        for (var k in arrayList) {
            arrayList[k] = typeof arrayList[k] == 'function' ?
                await arrayList[k]().catch(() => { }) ?? {} :
                fs.existsSync(`src/json/${arrayList[k]}.json`) ?
                    JSON.parse(fs.readFileSync(`src/json/${arrayList[k]}.json`)) :
                    await axios.get(`https://raw.githubusercontent.com/raIeigh/poopy-json/main/${arrayList[k]}.json`).then(res => res.data).catch(() => { }) ?? {}
        }

        return arrayList
    },
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createData(dataType) {
    var dataGet = dataGetters[dataType]
    dataGetters[dataType] = async function () {
        while (dataGetting[dataType]) await sleep()
        if (dataGotten[dataType]) return dataGotten[dataType]

        dataGetting[dataType] = true
        var result = await dataGet().catch((e) => console.log(e))

        if (result) dataGotten[dataType] = result
        delete dataGetting[dataType]

        return result
    }
}

for (var name in dataGetters) {
    createData(name)
}

module.exports = dataGetters