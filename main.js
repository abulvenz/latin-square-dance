import m from "mithril";
import tagl from "tagl-mithril";

const { random, trunc } = Math;
const { assign, keys } = Object;

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);

const range = (S, N, r = []) => ((S === N) ?
    r :
    range(S + (N > S ? 1 : -1), N, [...r, S]));
const squareFunc = (N, f) => range(0, N)
    .map((r) => range(0, N).map((c) => f(r, c)));
const use = (v, fn) => fn(v);
const swap = (arr, i, j) => use(arr[i], (old_i) => [
    arr[i] = arr[j],
    arr[j] = old_i
] ? arr : undefined);
const flatMap = (arr, fn = (e) => e) => arr
    .reduce((acc, v) => acc.concat(fn(v)), []);
const swaprows = swap;
const swapcolumns = (field, i, j) => field.forEach((row) => swap(row, i, j));
const swapnumbers = (field, i, j) => field
    .forEach((row) => swap(row, row.indexOf(i), row.indexOf(j)));
const shuffle = (arr, r = []) => use(
    (r.length === 0 ? arr.map((e) => e) : arr),
    (arr_) => arr_.length === 0 ? r : shuffle(arr_, [
        ...r,
        arr_.splice(trunc(random() * arr_.length), 1)[0]
    ]));
const pickRandomly = (arr = []) => arr[trunc(random() * arr.length)];
const size = (sq) => sq.length;
const contains = (arr, n) => arr.indexOf(n) >= 0;
const without = (arr, remove) => arr.filter((e) => !contains(remove, e));

const coincide = (a1, a2) => a1.every((e1, idx) => e1 !== a2[idx]);
const empty = (arr) => arr.length === 0;
const column = (mat, cidx) => mat.map((row) => row[cidx]);

const repeat = (something, times) => range(0, times).map((i) => something);
const leftPad = (str, length, char = "0") => use(
    repeat(char, length).join("") + String(str),
    (orig) => orig.substr(-length, length)
);

let N = 4;

const sizes = [4, 5, 6, 8, 9, 10, 12, 16, 36];
let sizeidx = 0;

const square2 = [
    [1, 2, 3, 4],
    [2, 3, 1, 4],
    [3, 1, 2, 4],
    [1, 2, 3, 4]
];

const generate = function(N) {
    /**
     * Pick first row randomly.
     */
    const result = [shuffle(range(1, N + 1))];

    const alphabet = range(1, N + 1);

    /**
     * Generate the remaining rows and push them to the result.
     */
    range(1, N).forEach(function(rowidx) {
        /**
         * To each column all numbers of the alphabet can be
         * added that are not already contained.
         */
        const allowedNumbersPerColumn = range(0, N)
            .map((c) => without(alphabet, column(result, c)));

        /**
         * Inverse the possibilities: For each number find
         * which columns are still allowed.
         */
        const allowedColumnsPerNumber = alphabet.map((num) => assign({
            num: num,
            columns: allowedNumbersPerColumn
                .map((numbersForColumn, column) =>
                    contains(numbersForColumn, num) ? column : undefined)
                .filter((e) => e !== undefined)
        }));

        let newRow = [];

        const pluck = (fieldName) => (obj) => obj[fieldName];

        const histogram = (arr) => arr.reduce((acc, v) => assign(acc, {
            [v]: (acc[v] || 0) + 1
        }), {});

        /**
         * We will find for each number an allowed position, add
         * it there and remove the number from allowedColumnsPerNumber
         */
        while (!empty(allowedColumnsPerNumber)) {

            /**
             * Find out, if an immediate action has to be taken into account:
             * If a specific column is only allowed for one number, we need to
             * place that number there. Otherwise we might get columns where
             * no numbers can be assigned anymore.
             */
            const histogramOfColumns = histogram(flatMap(
                allowedColumnsPerNumber,
                pluck("columns")
            ));

            /**
             * Sanitycheck of the histogram. Still possible?
             */
            if (keys(histogramOfColumns).length !==
                allowedColumnsPerNumber.length) {
                console.error(histogramOfColumns);
                print(result);
                console.log(newRow);
                throw Error("Not solvable anymore");
            }

            let column;
            let next;

            /**
             * If an immediate action is needed, carry it out directly.
             * I.e. select the number and column, where the column only
             * allows for that number. Otherwise we take the number that
             * is allowed in the fewest columns to maximise the
             * number of choices. I'm not sure if this changes anything
             * from a statistical point of view.
             */
            if (keys(histogramOfColumns)
                .some(key => histogramOfColumns[key] === 1)) {
                column = Number(
                    keys(histogramOfColumns)
                    .filter(key => histogramOfColumns[key] === 1)[0]
                );
                const index = allowedColumnsPerNumber
                    .findIndex(pcan => contains(pcan.columns, column));
                next = allowedColumnsPerNumber.splice(index, 1)[0];
            } else {
                allowedColumnsPerNumber
                    .sort((a, b) => size(a.columns) - size(b.columns));
                next = allowedColumnsPerNumber.splice(0, 1)[0];
                column = pickRandomly(next.columns);
            }
            allowedColumnsPerNumber
                .forEach(k => k.columns = k.columns.filter(e => e !== column));
            newRow.push({ num: next.num, column })
        }

        result.push(
            range(0, N)
            .map((i) => newRow.filter(e => e.column === i)[0].num)
        );

    });

    return result;
};

const print = mat => console.log(mat.map(e => e.join(",")).join("\n"));

let square = generate(N)
print(square);

const selection = {
    rowidx: [],
    colidx: [],
    numidx: [],
};

const selectRow = ridx => {
    selection.rowidx.push(ridx);
    if (selection.rowidx.length === 2) {
        swaprows(square, selection.rowidx[0], selection.rowidx[1])
        selection.rowidx = [];
    }
};

const selectColumn = ridx => {
    selection.colidx.push(ridx);
    if (selection.colidx.length === 2) {
        swapcolumns(square, selection.colidx[0], selection.colidx[1])
        selection.colidx = [];
    }
};
const selectNumber = ridx => {
    selection.numidx.push(ridx);
    if (selection.numidx.length === 2) {
        swapnumbers(square, selection.numidx[0], selection.numidx[1])
        selection.numidx = [];
    }
};



const rowSelected = i => contains(selection.rowidx, i);
const colSelected = i => contains(selection.colidx, i);
const numSelected = i => contains(selection.numidx, i);

let displayNumbers = false;
let mode = 0;

setInterval(function() {
    if (mode === 1) {
        range(0, N - 1).forEach(function(i) {
            if (square[i][0] > square[i + 1][0]) {
                swaprows(square, i, i + 1);
            }
            if (square[0][i] > square[0][i + 1]) {
                swapcolumns(square, i, i + 1);
            }
        });
    } else if (mode === 2) {
        range(0, N).forEach(function(rowidx) {
            range(0, N).forEach(function(colidx) {
                if (square[rowidx][colidx] === 1) {
                    if (colidx !== rowidx) {
                        swapcolumns(
                            square,
                            colidx,
                            colidx + (rowidx - colidx > 0 ? 1 : -1)
                        );
                    }
                }
            });
        });
    } else if (mode === 3) {
        range(0, N - 1).forEach(function(i) {
            if (square[i][0] > square[i + 1][0]) {
                swaprows(square, i, i + 1);
            }
            if (square[0][i] > square[0][i + 1]) {
                swapcolumns(square, i, i + 1);
            }
        });
    }
    m.redraw();
}, 30);

m.mount(document.body, {
    view: vnode => [div.banner(
            h1("Latin Square Dance"),
        ),
        div.wrapper(
            div["board" + size(square)](
                square.map((row, ridx) => [row.map((element, cidx) =>
                    div.box[
                        `child${leftPad(String(trunc(element * 100 / N) - 1),
                        4,
                        "0")}`](displayNumbers ? element : " ")
                ), div.checker[rowSelected(ridx) ?
                    "selected" : ""]({ onclick: e => selectRow(ridx) })]),

                range(0, size(square)).map(cidx => div.checker[
                    colSelected(cidx) ?
                    "selected" :
                    ""
                ]({ onclick: e => selectColumn(cidx) })),
                div.checker({ onclick: e => square = generate(N) }),

                range(1, size(square) + 1).map(cidx => div.checker[
                    numSelected(cidx) ?
                    "selected" :
                    ""
                ]({ onclick: e => selectNumber(cidx) }, leftPad(cidx, 2))),
                div.checker({ onclick: e => displayNumbers = !displayNumbers }),
            )),
        div.checker({
            onclick: (e) => mode = (mode + 1) % 4
        }, "sort " + (mode)),
        input({
            type: "range",
            value: sizeidx,
            min: 0,
            max: size(sizes) - 1,
            oninput: e => {
                console.log(e);
                sizeidx = Number(e.target.value);
                N = sizes[sizeidx];
                square = generate(N);
            }
        })
    ]
});