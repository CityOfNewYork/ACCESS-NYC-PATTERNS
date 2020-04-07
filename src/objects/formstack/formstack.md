[Formstack](https://www.formstack.com) is an cloud based service for custom form building and publishing of online forms. Forms hosted on their platform can be styled using [themes](https://www.formstack.com/features/themes-css) and the ACCESS NYC Patterns includes a stylesheet for integrating form styling for Formstack Themes.

include{{ objects/formstack/formstack-theme-demo.slm }}

### Usage

1. Create a new Formstack Theme following [this tutorial](https://help.formstack.com/hc/en-us/articles/360019204492-Themes). You can name the theme **ACCESS NYC Patterns**.
1. Under *Quick Styles*, change the form font to **Noto Sans**. You do not need to modify any of the other settings.
1. Under *Advanced Code Editor*, copy and paste the following code into the css editor and save your changes.

include{{ objects/formstack/formstack.slm }}

The comment will let other users know where the code source is coming from and what version of the ACCESS NYC Patterns are being used in the theme.

### Development

If you are modifying the theme for Formstack you should create a new theme and import the development url of the distributed stylesheet into it. It helps to use [semantic versioning](https://semver.org) in the name of the theme when developing so you know which one is the most up to date.

Once you have created a new theme, copy and paste the following snippet into the *Advanced Code Editor*.

    @import url('https://fonts.googleapis.com/css?family=Noto+Serif:400');
    @import url('http://localhost:7000/objects/formstack/formstack.css');

It is also good practice to apply themes in development to sample forms. You can either copy an existing form or use a "development" form that utilizes all of the fields Formstack provides. Once the development theme is applied to the development form, you can use the *View Live Form* link to view changes you are making.