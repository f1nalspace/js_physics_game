/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collision.ContactList",
    [
        "final.collection.Pool",
        "final.collision.Contact"
    ],
    function (final, Pool, Contact) {
        return function () {
            var contacts = new Pool(function () {
                return new Contact();
            });
            contacts.expand(10000);
            return {
                add: function () {
                    return contacts.get();
                },
                clear: function () {
                    contacts.clear();
                },
                size: function () {
                    return contacts.size();
                },
                item: function (index) {
                    return contacts.item(index);
                }
            };
        };
    }
);