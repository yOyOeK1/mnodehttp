

function cl( str ){
    console.log('vueT   ',str);
}

function mkVueTemplateStr( tr, fullPath ){
    cl('---------- vue -------------'+fullPath);
                                
    let vTemp = String(tr).split('<template>');
    if( vTemp.length > 1 )
        vTemp = vTemp[1].split("</template>")[0];
    else
    vTemp = '';
    //cl( vTemp);

    let vjs = String(tr).split('<script>');
    if( vjs.length > 1 )
        vjs = vjs[1].split("</script>")[0];
    else
    vjs = '';
    //cl( vjs);

    let vstyle = String(tr).split('<style>');
    if( vstyle.length > 1 )
    vstyle = vstyle[1].split("</style>")[0];
    else vstyle = '';
    //cl(vstyle);

    if( vjs != '' || vTemp != '' ){

        if( vjs != '' ){
           vjs = vjs.replace(
                'export default {',
                'export default { template:`'+vTemp+'`,'
            );
        }else if ( vTemp != '' ) {
            vjs = 'export default { template:`'+vTemp+'` } ';
        }


        if( vstyle != '' ){
            vjs = ` 
                $(document).ready(function() {
                    $("body").append( \`<style>${vstyle}</style>\` );
                    console.log("inject style ... vue");
                });
            
                ${vjs}`;
        }

        //cl(vjs);
        cl(" *.vue template DooING IT");
        tr = vjs;
    }
    cl('---------- vue -------------END');
    return tr;
}

module.exports = { mkVueTemplateStr };