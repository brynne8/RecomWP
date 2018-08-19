# RecomWP
Wikipedia Recommendation System

The repo is still in alpha stage. Only for Chinese Wikipedia currently.

# Usage
## For unregistered Wikipedia users / Wikipedia readers
Download addon Tampermonkey [Firefox](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/) [Chrome](https://chrome.google.com/webstore/search/tampermonkey)

Open dashboard (管理面板), click the `+` button, and you will see a page that can create your own user scripts. Here, we copy all the code from the [RecomWP.js](https://github.com/AlexanderMisel/RecomWP/blob/master/RecomWP.js) file to the editor and <kbd>CTRL</kbd>+<kbd>S</kbd> to save it. There's nothing else you should do.

Just open Wikipedia [home page](https://zh.wikipedia.org/wiki/Wikipedia:%E9%A6%96%E9%A1%B5) and check what changed

![default](https://screenshotscdn.firefoxusercontent.com/images/557d66de-3ce8-4f9a-bb4f-639dea26d972.png)

A new link appeared and that's the link to RecomWP. You should first open some articles that you like and then you will get the Recommeded articles base on the articles you visited.

![default](https://screenshotscdn.firefoxusercontent.com/images/7104cb37-f333-4625-964f-e6654f39a4cc.png)

## For Wikipedia users
Of course you can use the method above, there's another option. You can simply add one line to your [common.js](https://zh.wikipedia.org/wiki/Special:MyPage/common.js)
```js
importScript('User:Alexander Misel/test2.js');
```
And you will see the same things as above.
