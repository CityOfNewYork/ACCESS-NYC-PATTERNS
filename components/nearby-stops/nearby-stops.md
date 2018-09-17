The Nearby Stops Component will parse a list of MTA subway transit data from the [NYC Open Data Portal](https://data.cityofnewyork.us/Transportation/Subway-Stations/arq3-7z49) and use a single latitude and longitude and locate the nearest stop. Note, it will not fetch the data directly but it will retrieve it from a local endpoint.

This component requires Javascript for functionality. To use the it from the global ACCESS NYC Patterns script use the following code;

    var access = new AccessNyc();
    access.nearbyStops();

This will select any DOM element with the `data-js="nearby-stops"` attribute and look up the closest stops to the location embedded in the `data-nearby-stops-location` attribute. The location attribute accepts an array of latitude and longitude. Use the `data-nearby-stops-endpoint` attribute to set the endpoint of the data. The amount of stops defaults to 3 but it can be overwritten using the `data-nearby-stops-amount` attribute which accepts a number of stops to show.