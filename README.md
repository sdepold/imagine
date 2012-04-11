# Description

This app allows to view all images in your cloudapp account. Furthermore those images can be transformed into code, you could embed in your blog or homepage. It renders a small image which is included into an anchor tag. The small image is furthermore resized with the built-in `node-imageable` component. This app is designed to work with fancybox.

# Deployment on heroku

As you don't want to setup your cloudapp credentials via a public repository, you can use heroku's environment variable setup method to get things done. Obviously it would also help to have the credentials stored locally in one specific file, so you don't have to specify those data all the time via commandline exports. The solution for that is more or less straight forward: Use `config/config.json` for your local development, but make 100% sure to never commit that file (it is already ignored in git). For the actual production usage, we can use [this article](https://devcenter.heroku.com/articles/config-vars).

First of all you should take a look at the `config/config.example.json`. It's basically an extended version of the configuration file of [node-imageable-server](https://github.com/dawanda/node-imageable-server). What's new in it, is the cloudapp part. Just enter your cloudapp email address and your password and you are done.

What you have to do to get actually the code run on heroku is [described here](https://devcenter.heroku.com/articles/nodejs). Notice that the `Procfile` is already in place. This is what you have to do, assuming that you already used the heroku binary locally.

```console
heroku create --stack cedar
git push heroku master
heroku ps:scale web=1
heroku config:add NODE_ENV=production
```

After those basic steps, we have to setup the configuration of the project. For that, you just have to run `node` and to execute `JSON.stringify(contentOfYourConfig.json)`. Using the example configuration, it looks like this:

```code
JSON.stringify({
  "secret":       "my-very-secret-secret"
, "magicHash":    "magic"
, "namespace":    ""
, "maxListeners": 512
, "cloudapp": {
    "username": "cloudapp@host.com",
    "password": "p4ssw0rd"
  }
})
```

Now take the result and use `config:add` again:

```console
heroku config:add CONFIG=<resultOfJSONStringify>
# e.g. heroku config:add CONFIG='{"secret":"my-very-secret-secret","magicHash":"magic","namespace":"","maxListeners":512,"cloudapp":{"username":"cloudapp@host.com","password":"p4ssw0rd"}}'
```

Now that everything is up and running, you might want to rename the application in order to get a nicer URL for it. Just do this:

```console
heroku rename nameOfNewApp
```


# Authors/Contributors

- DaWanda GmbH
- Sascha Depold ([Twitter](http://twitter.com/sdepold) | [Github](http://github.com/sdepold) | [Website](http://depold.com))
