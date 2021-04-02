import fs from 'fs';
//import axios from 'axios';
import htmlHelper from '../helpers/htmlHelpers.js';

let adventechLangauges = JSON.parse(fs.readFileSync('./p9n-language-index-adventech.json', 'utf-8'));
let egwwritingsLangauges = JSON.parse(fs.readFileSync('./p9n-language-index-egwwritings.json', 'utf-8'));
//console.log(adventechLangauges)

const languageResolver = {
    Query: {
        //getlanguages(source_id: ID!)
        getbook: (root, args, context, info) => {
            var languageFound = null;
            var bookFound = null;

            const {id} = args
            const {db} = context
            {
                console.log(id)
                const splits = id.split('/');
                console.log(splits)
                if(splits.length < 3) {
                    return null;
                }
                var language_id = `${splits[0]}/${splits[1]}`;

                if(splits[0] === 'adventech') {
                    languageFound = adventechLangauges.filter(language => language.language_id.toString() === language_id)[0];                    

                    if(languageFound) {
                        var av_book = languageFound.books.filter(book => book.book_id.toString() === id.toString())[0];
                        console.log(languageFound, av_book)
                        bookFound = bookFromAdventechBook(id, av_book)
                    }

                } else if(splits[0] === 'egwwritings') {
                    languageFound = egwwritingsLangauges.filter(language => language.language_id.toString() === language_id)[0];
    
                }

                return bookFound;

            }
        },

        getbooks: (parent, args, { db }, info) => {
            var languageFound = null;
            const { language_id } = args

            const splits = language_id.split('/');

            if(splits[0] === 'adventech') {
                languageFound = adventechLangauges.filter(language => language.language_id.toString() === language_id.toString())[0];                    

                if(languageFound) {
                    return languageFound.books.map(b => bookFromAdventechBook(b.book_id, b))
                }

            } else if(splits[0] === 'egwwritings') {
                languageFound = egwwritingsLangauges.filter(language => language.language_id.toString() === language_id.toString())[0];
            }

            return null;
        }


    }
}

function bookFromAdventechBook(id, av_book) {
    return {
        book_id: av_book.book_id,
        book_title: av_book.book_info.title,
        book_path: id,
        book_desc: av_book.book_info.description,
        book_img_src: `${av_book.book_id}/${av_book.book_cover.name}`,
        chapters: [],
        pages: []
    }
}
export default languageResolver