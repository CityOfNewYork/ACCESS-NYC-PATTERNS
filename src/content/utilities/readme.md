Utilities allow the flexibility to change specific properties of every Pattern in certain views. For example, if a Pattern is set to `display: block` in one view but in another it needs to be set to `display: inline`, one solution would be to create another type of the Pattern. However, a UI developer may need to repeat this process for other Patterns.

A Utility class, such as Tailwind’s `.inline` [display utility](https://tailwindcss.com/docs/display), allows the developer to reuse this attribute without creating a different pattern type. This use case can be extended to every possible CSS attribute, such as color, position, font-families, margin, padding, etc. In addition, they can be bundled within media queries so certain utilities can work for specific screen sizes.

The ACCESS NYC Patterns integrate the [tailwindcss utility-first framework](/tailwindcss). Other utilities extend tailwindcss to include support for screen readers and right-to-left reading directions.
