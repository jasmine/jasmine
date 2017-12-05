getJasmineRequireObj().Truthy = function(j$) {

    function Truthy() {}

    Truthy.prototype.asymmetricMatch = function(other) {
        if (other) {
            return true;
        }

        return false;
    };

    Truthy.prototype.jasmineToString = function() {
        return '<jasmine.truthy>';
    };

    return Truthy;
};
