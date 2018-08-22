# RecomWP
Wikipedia Recommendation System

The repo is still in alpha stage. Only for Chinese Wikipedia currently.

## Usage
### For unregistered Wikipedia users / Wikipedia readers
Download addon Tampermonkey [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/) / [Chrome](https://chrome.google.com/webstore/search/tampermonkey)

Just open [RecomWP.user.js](https://github.com/AlexanderMisel/RecomWP/blob/master/RecomWP.user.js) file and install it with your favorite user script manager. The script is also available on [Greasy Fork](https://greasyfork.org/zh-CN/scripts/371385-recomwp).

Open Wikipedia [home page](https://zh.wikipedia.org/wiki/Wikipedia:%E9%A6%96%E9%A1%B5) and check what changed

![default](https://screenshotscdn.firefoxusercontent.com/images/557d66de-3ce8-4f9a-bb4f-639dea26d972.png)

A new link appeared and that's the link to RecomWP. You should first open some articles that you like and then you will get the Recommeded articles base on the articles you visited.

![default](https://screenshotscdn.firefoxusercontent.com/images/7104cb37-f333-4625-964f-e6654f39a4cc.png)

### For Wikipedia users
Of course you can use the method above, there's another option. You can simply add one line to your [common.js](https://zh.wikipedia.org/wiki/Special:MyPage/common.js)
```js
importScript('User:Alexander Misel/test2.js');
```
And you will see the same things as above.

## Contribution
The RecomWP is self-contained and so it doesn't rely on other libraries, so you'd better not using other libraries if it isn't so necessary. Your browser should support IndexedDB. Pull requests and issues are welcomed. I used a Binary Heap to sort the entries.

Your code should work in the following three situations before you submit a PR:
1. Normal setting for Wikipedia users by importing script in common.js
2. Tampermonkey userscript with jQuery enabled
3. Tampermonkey userscript with jQuery disabled (block jQuery by rule `*&modules=jquery*`, see [WikipediaWithoutJquery](https://github.com/AlexanderMisel/WikipediaWithoutJquery) )
