var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.all('/student/:id', function (req, res) {
	res.send('Yaay....got the message for student' + req.params.id);
});


app.post('/student', function (req, res) {
	res.send('Yaay..PUT..got the message for student' + req.params.id);
});

app.all('/course/:id', function (req, res) {
	res.send('Yaay....got the message for course' + req.params.id);
});


app.post('/course', function (req, res) {
	res.send('Yaay..PUT..got the message for course' + req.params.id);
});


app.listen('5000', function () {
	console.log('Boring');
});