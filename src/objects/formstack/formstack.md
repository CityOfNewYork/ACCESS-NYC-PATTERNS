[Formstack](https://www.formstack.com) is a data collection service that features a form builder for custom online forms. Forms can be styled using [themes](https://help.formstack.com/hc/en-us/articles/360019204492-Themes) and the ACCESS NYC Patterns includes a stylesheet for Formstack Themes.

### Usage

1. Create a new Formstack Theme following [this tutorial](https://help.formstack.com/hc/en-us/articles/360019204492-Themes). You can name the theme **ACCESS NYC Patterns**.
1. Under *Quick Styles*, change the form font to **Noto Sans**. You do not need to modify any of the other settings.
1. Under *Advanced Code Editor*, copy and paste the following code into the css editor and save your changes.

slm{{ objects/formstack/formstack.slm }}

The comment will let other users know where the code source is coming from and what version of the ACCESS NYC Patterns are being used in the theme.

### Development

If you are modifying the theme for Formstack you import the development url for the distributed stylesheet. Copy and paste the following snippet into the *Advanced Code Editor*.

    @import url('https://fonts.googleapis.com/css?family=Noto+Serif:400');
    @import url('http://localhost:7000/objects/formstack/formstack.css');