#### Global Script

To use the Autocomplete Input in the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/AccessNyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.inputAutocomplete();
    </script>

This function will attach the event listener to an input element with the default selector `[data-js='input-autocomplete__input']`.

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script:

    // ES6
    import InputAutocomplete from 'src/elements/inputs/input-autocomplete';

    // CommonJS
    import InputAutocomplete from 'dist/elements/inputs/input-autocomplete.common';

    <!-- IFFE -->
    <script src="dist/elements/inputs/input-autocomplete.iffe.js"></script>

    new InputAutocomplete();

#### Configuration

The method accepts an object `{}` with two properties; "selector" and "options".

* `selector` (optional) The selector for the input element. If no selector is provided the default
value will be set to `[data-js="input-autocomplete__input"]`.
* `options` (required) The suggested terms to be displayed in the dropdown. Each item is an array with the first item being the visible value. The following values are synonyms that score the priority of term higher if the user types it.
list. ex: `[['Bronx', 'Hunts Point', 'Arthur Avenue', 'Riverside', 'Mott Haven'], ['Queens', 'Corona', 'East Elmhurst', 'Forest Hills', 'Fresh Pond'], ['Brooklyn', 'Flatbush', 'Bay Ridge', 'DUMBO', 'Williamsburg'], ['Staten Island', 'South Beach', 'Fort Wadsworth', 'Todt Hill', 'Great Kills'], ['Manhattan', 'Lower', 'Midtown', 'Chinatown', 'SoHo']]`.
