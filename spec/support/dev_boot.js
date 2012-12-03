var originalJasmine = jasmine;
//copy clock methods back into window,
//so second jasmine load doesn't use jasmine clock methods.
jasmine.util.extend(window, jasmine.Clock.real);
jasmine = null;
