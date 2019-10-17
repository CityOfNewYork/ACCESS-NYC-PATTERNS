#### Global Script

To use the Autocomplete Input in the global ACCESS NYC Patterns script use the following code:

    <!-- Global Script -->
    <script src="dist/scripts/access-nyc.js"></script>

    <script>
      var access = new AccessNyc();
      access.inputsAutocomplete({
        options: [
          ['Bronx'], ['Queens']
        ]
      });
    </script>

This function will instantiate the autocomplete with the provided options and attach the event listener to an input element with the default selector `[data-js='inputs-autocomplete__input']` (see markup details in the example above ). Below is an advanced configuration that passes a callback to the "selected" method of the autocomplete class. This callback is executed after a user has selected an option and the input value has been set. It will pass the selected value (`String`) as the first argument and the autocomplete class (`Object`) as the second.

    var autocomplete = access.inputsAutocomplete({
      selected: function(value, autocomplete) {
        console.dir('Selected ' + value + '!');
      }
    });

##### Updating Options

Below is an example of using the options setter to update the options after the class has been instantiated.

    autocomplete.options([
      ['Bronx'], ['Queens'], ['Brooklyn'], ['Staten Island'], ['Manhattan']
    ]);

##### Providing Synonyms

Each option can be provided with a list of synonyms that will score the option higher as the user types. Try it out in the example above by typing "Hunts Point" in the input. The option "Bronx" will be listed before all other options. This method can be used to provide common terms for specific search terms that exist in your site.

    autocomplete.options([
      ['Bronx', 'Hunts Point', 'Arthur Avenue', 'Riverside', 'Mott Haven'],
      ['Queens', 'Corona', 'East Elmhurst', 'Forest Hills', 'Fresh Pond'],
      ['Brooklyn', 'Flatbush', 'Bay Ridge', 'DUMBO', 'Williamsburg'],
      ['Staten Island', 'South Beach', 'Fort Wadsworth', 'Todt Hill', 'Great Kills'],
      ['Manhattan', 'Lower', 'Midtown', 'Chinatown', 'SoHo']
    ]);

##### Providing Strings

The list of strings below are used for screenreader accessiblity by default. They can be overridden using the `.strings` method and passing an object of new strings. For the options strings, a dynamic variable string (denoted by `{{ }}` below) is provided and rendered in the output of the string. This method can be used to provide a localized set of strings.

    autocomplete.strings({
      'DIRECTIONS_TYPE': 'Start typing to generate a list of potential input options',
      'DIRECTIONS_REVIEW': 'Keyboard users can use the up and down arrows to review options and press enter to select an option',
      'OPTION_AVAILABLE': '{{ NUMBER }} options available',
      'OPTION_SELECTED': '{{ VALUE }} selected'
    });

#### Configuration

The InputAutocomplete class accepts an object `{}` with the following properties:

* `options` (`Array` required) The suggested terms to be displayed in the dropdown. Each item is an array with the first item being the visible value. The following values within each array are treated as synonyms that score the priority of term higher if the user types it.
* `selected` (`Function` optional) A callback method that will be executed when a user has selected an option.
* `selector` (`String` optional) The selector for the input element. If no selector is provided the default
value will be set to `[data-js="inputs-autocomplete__input"]`.

#### Cherry-picked Module Import

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script. The methods and configurations described above will work with the dedicated module.

    // ES6
    import InputAutocomplete from 'src/elements/inputs/inputs-autocomplete';

    // CommonJS
    let InputAutocomplete = require('dist/elements/inputs/inputs-autocomplete.common');

    <!-- IFFE -->
    <script src="dist/elements/inputs/inputs-autocomplete.iffe.js"></script>

    new InputsAutocomplete({
      options: [
        ['Bronx'], ['Queens']
      ]
    });
