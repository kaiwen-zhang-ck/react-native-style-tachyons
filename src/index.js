import _ from "lodash";
import Color from "color";
import * as reactWrapper from "./reactWrapper";
import { heights, minHeights, maxHeights } from "./styles/heights"
import { widths, minWidths, maxWidths } from "./styles/widths"
import * as borders from "./styles/borders"
import flexbox from "./styles/flexbox"
import spacing from "./styles/spacing"
import typeScale from "./styles/typeScale"
import text from "./styles/text"
import images from "./styles/images"
import fontWeights from "./styles/fontWeights"
import opacity from "./styles/opacity"
import utilities from "./styles/utilities"

const debug = require("debug")("react-native-tachyons")

const NativeTachyons = {
    wrap: reactWrapper.wrap,

    /* placeholder */
    styles: {},

    /* placeholder */
    colors: {},

    /* placeholder */
    sizes: {},

    build: function build(options = {}, StyleSheet) {

        _.defaultsDeep(options, {
            rem: 16,
            colors: {
                lighten: 0.2,
                darken: 0.2,
                palette: {
                    white: "#ffffff",
                    black: "#000000",
                }
            },
            fonts: {
            }
        })

        /* assign all the styles */
        const styleSheet = {}
        _.assign(styleSheet, borders.styles)
        _.assign(styleSheet, flexbox)
        _.assign(styleSheet, fontWeights)
        _.assign(styleSheet, images)
        _.assign(styleSheet, text)
        _.assign(styleSheet, opacity)
        _.assign(styleSheet, utilities)

        /* calculate rem scales */
        const sizes = {}
        const REM_SCALED = [
            heights,
            minHeights,
            maxHeights,
            widths,
            minWidths,
            maxWidths,
            spacing,
            typeScale,
            borders.radii
        ]

        _.forEach(REM_SCALED, subSheet => {

            /* assign to styleSheet */
            _.assign(styleSheet,
                _.mapValues(subSheet, style =>
                    _.mapValues(style, val => val * options.rem)
                )
            )

            /* sizes for export */
            _.forEach(subSheet, (rule, tachyonsKey) => {
                _.forEach(rule, val => {
                    sizes[tachyonsKey] = val * options.rem
                })
            })
        })
        debug("got sizes:", sizes)

        /* palette colors: dark and light variant */
        const allColors = _.transform(options.colors.palette, (result, val, key) => {
            result[key] = val;

            /* light and dark alternatives */
            if (options.colors.lighten !== false) {
                result[`light-${key}`] = new Color(val).lighten(options.colors.lighten).hexString();
            }
            if (options.colors.darken !== false) {
                result[`dark-${key}`] = new Color(val).darken(options.colors.darken).hexString();
            }

            /* alpha variants */
            for (let i = 10; i < 100; i += 10) {
                const name = `${key}-${i}`;
                const rgbString = new Color(val).alpha(i / 100).rgbString();
                debug(`writing alpha variant: ${name}: ${rgbString}`)
                result[name] = rgbString;
            }

        }, {});

        /* colors: background, foreground and border */
        _.forEach(allColors, (val, key) => {
            styleSheet[`bg-${key}`] = { backgroundColor: val }
            styleSheet[`${key}`] = { color: val }
            styleSheet[`b--${key}`] = { borderColor: val }
        });

        /* font-families */
        _.forEach(options.fonts, (val, key) => {
            styleSheet[`ff-${key}`] = { fontFamily: val }
        });

        _.assign(NativeTachyons.sizes, hyphensToUnderscores(sizes));
        _.assign(NativeTachyons.colors, hyphensToUnderscores(allColors));
        _.assign(NativeTachyons.styles, StyleSheet.create(hyphensToUnderscores(styleSheet)));
    }
}

function hyphensToUnderscores(sourceObj) {
    const translated = {}

    /* copy all properties */
    _.assign(translated, sourceObj);

    /* create hypened versions */
    _.forEach(sourceObj, (val, key) => {
        if (key.includes("-")) {
            debug(`replacing ${key} -> ${key.replace(/-/g, "_")}`)
            translated[key.replace(/-/g, "_")] = val;
        }
    })

    return translated;
}


export default NativeTachyons;
export const sizes = NativeTachyons.sizes;
export const colors = NativeTachyons.colors;
export const styles = NativeTachyons.styles;
export const wrap = reactWrapper.wrap;
export const build = NativeTachyons.build;
