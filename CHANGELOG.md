## current

- [ ] TODO @yss ws address to connect as a href parser ? same host for http same for ws if not set in config?

- [ ] @mnodehttp 
  
  - [ ] when no clients don't ping
  
  - [ ] config option log level? to be no logs to console 

- [ ] @yss new site *3d action clips* exploration into threejs and mixers of blender -> gbl -> 3d scene on web page with control over action clips define in blender to have nice ability to control your 3d objects. Chk sites / 3d action clips

- [ ] @sites 3d_action_clips / t4y_click - when left a site it's still active 

- [ ] @yss site.json visible: true | false

- [ ] @yss screen manager revamp  
  
  - [ ] loosing enhance from jqm in external screens

- [ ] @node-yss sitesHelp.js need getInjectionStre fix. remove old stuff about external or not external site. now all are external

- [ ] @otdmTools - port to npm o.O
  
  - [x] wrap it in node **nodeotdmTools** project name as a playground using python-shell
  
  - [x] make some test
  
  - [x] added some *-forceHttpIp*, *-forceHttpPort*, *-forceWSIp*, *-forceWSPort* argument to force settings in Http and WS
  
  - [ ] TODO when working on WS or Http using otdmTool from Sapi we don't get result :/
  
  - [ ] dependencies

- [ ] TODO **...?qtdmQ:....** where to put it?

- [ ] wsCallBack for *yss* websocet basic commands 
  
  - [x] *SM:* - screen manager separet group flow 
  - [x] *toMqttPub:* - from ws to mqtt (now it's spitting it out from node)

- [x] @npm_postinstall did a tests chk */home/yoyo/Apps/npmScriptTest1*. It's use case example of postinstall script. To do git partial directory cloning?

## v251008

- [x] version 0.0.15
- [x] can do mimetype for json
- tests on site as promise not done
- injecton of sites rebuild to add variables for viteyss-runIt
- some debug for siteNo info


## v250716 yss

- [x] is down to one websocet connection :) oryginaly it had 3

- [x] need to look in href to check for **&resizeTo=w,h** so kiosk can be adjusted

- [x] if site in load after use and there is no last time use site it's freez. not found site handler

- [x] double *getMenu* execution why? but not it's doing it one time

## v0.1.7 mnodehttp

- [x] found lost parts :)

- [x] *fsHelp* have cashe option

## v0.01 node-red-contrib-mnodehttp

- [x] node in node-red-contrib first steps  
- [x] prevent having two instances on same config  
- [x] can do some configuration   
  - [x] path to yss - need some fixing and checking if it's working
  - [x] paths to sites - need to be checked
  - [x] ui clean up in configuration of the node
  - [x] readme / doc 
- [x] ws in to *mnodehttp* instance
  - [x] ws out to node. 
  - [x] node to ws.

## v0.1.6

- [x] @mnodehttp fsHelp got **fileReadToStr**, **getTempFilePath** 

## v0.1.5

- [x] @node-yss external folders for sites
- [x] @yss ws organize alerts and reconections. Now it show only one error rest is stack up to point of reconnect
- [x] @node-yss make mnodehttp as instance can take config 
- [x] @yss prevent sending msg if not connected :)
- [x] @mnodehttp have 
  - *startIt.js* for release lib operations
  - *startItAsDev.js* for development dev paths

## v0.1.4