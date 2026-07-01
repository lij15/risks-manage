sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"risks/risks/test/integration/pages/RisksList",
	"risks/risks/test/integration/pages/RisksObjectPage"
], function (JourneyRunner, RisksList, RisksObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('risks/risks') + '/test/flp.html#app-preview',
        pages: {
			onTheRisksList: RisksList,
			onTheRisksObjectPage: RisksObjectPage
        },
        async: true
    });

    return runner;
});

