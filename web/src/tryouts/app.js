fs = require('fs');
arcgis = require('arcgis');
tf = require('terraformer');
tap = require('terraformer-arcgis-parser');
unirest = require('unirest');

console.log("Converting GeoJSON");

fs.readFile('data/altglascontainer.json', function(err, buffer) {
    if (err) {
        console.error(err);
        return;
    }

    var fileContent = buffer.toString();
    var contentAsJson = JSON.parse(fileContent);
    var featureCollection = new tf.FeatureCollection(contentAsJson);
    featureCollection.forEach(function(feature, index, coordinates) {
        if (feature.geometry) {
            var esriGeometry = tap.convert(feature.geometry);
            var coordinates = [ { 'x': esriGeometry.x, 'y': esriGeometry.y } ];
            var geometries = { 'geometryType': 'esriGeometryPoint', 'geometries': coordinates };
            var request = unirest.get("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/project");
            //request.proxy("http://localhost:8888");
            request.headers({'Accept': 'application/json'})
                .send({
                    'f': 'json',
                    'inSR': '25832',
                    'outSR': '4326',
                    'geometries': JSON.stringify(geometries)
                })
                .end(function (response) {
                    if (response && response.geometries) {
                        var projectedCoordinates = response.geometries[0];
                        var latitude = projectedCoordinates.y;
                        var longitude = projectedCoordinates.x;
                        console.log(projectedCoordinates.toString());
                    }
                });
        }
    });
    console.log("Convertion in progress . . .");
});