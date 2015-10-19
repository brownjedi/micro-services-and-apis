'use strict';

function transformError(status, message) {
	return {
		type: "error",
		errors: [{
			version: "v1",
			status: status,
			message: message
		}]
	};
}

function transformSubscription (subscriptions) {

	let data = {
		type: "subscription",
		subscriptions: []
	};

	if(!subscriptions) {
		return data;
	}

	if(subscriptions.constructor !== Array) {
		pushDataToSubscriptionsArray(subscriptions);
	} else {
		subscriptions.forEach((subscription) => {
			pushDataToSubscriptionsArray(subscription);
		});
	}

	function pushDataToSubscriptionsArray(result) {
		data.subscriptions.push({
			subscriptionID: result.subscriptionID,
			data:{
				callback: result.callback,
				events: result.events,
				link: {
					rel: "self",
					href: `/api/v1/eventhub/subscriptions/${result.subscriptionID}`
				}
			}
		});
	}

	return data;
}

module.exports.transformError = transformError;
module.exports.transformSubscription = transformSubscription;