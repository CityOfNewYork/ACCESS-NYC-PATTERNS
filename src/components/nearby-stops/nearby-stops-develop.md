#### Global Script

This component requires JavaScript to function. To use it from the global ACCESS NYC Patterns script use the following code:

    var access = new AccessNyc();
    access.nearbyStops();

#### Module

The ES6, CommonJS, and IFFE modules all require importing and object instantiation in your main script:

    import NearbyStops from '../components/nearby-stops/nearby-stops';
    new NearbyStops();

The class will select any DOM element with the `data-js="nearby-stops"` attribute and look up the closest stops to the location embedded in the `data-nearby-stops-location` attribute. The location attribute accepts an array of latitude and longitude.

Use the `data-nearby-stops-endpoint` attribute to set the endpoint of the data. The amount of stops defaults to 3 but can be overwritten using the `data-nearby-stops-amount` attribute, which accepts a number of stops to display.