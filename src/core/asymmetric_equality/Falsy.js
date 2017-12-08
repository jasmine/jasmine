getJasmineRequireObj().Falsy = function(j$) {

    function Falsy() {}

    Falsy.prototype.asymmetricMatch = function(other) {
        if (!other) {
            return true;
        }

        return false;
    };

    Falsy.prototype.jasmineToString = function() {
        return '<jasmine.falsy>';
    };

    return Falsy;
};
