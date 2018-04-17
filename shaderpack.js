var fs = require("fs");

shaderPack(__dirname);

function shaderPack(root)
{
    console.log(`监控shader变化，自动生成shaders.ts`);
    fs.watch(root + "/shaders", { recursive: true }, changeHandler);

    //用于控制连续修改只执行一次打包
    var count = 0;

    function changeHandler(event, filename)
    {
        console.log(filename + " 发生变化")
        count++;
        setTimeout(function ()
        {
            count--;
            if (count == 0)
                pack();
        }, 100);

        function pack()
        {
            try
            {
                var savePath = root + "/" + "src/autofiles/shaders.ts";
                var filesContent = readFiles(getFilePaths(root + "/" + "shaders"));
                //替换路径
                filesContent = ((files) =>
                {
                    var newobj = {};
                    for (var path in files)
                    {
                        if (files.hasOwnProperty(path))
                        {
                            //替换路径
                            newobj[path.replace(root + "/", "")] = files[path];
                        }
                    }
                    return newobj;
                })(filesContent);
                var contentStr = JSON.stringify(filesContent, null, '\t').replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1')
                writeFile(savePath, `namespace feng3d\n{\nfeng3d.shaderFileMap = ${contentStr}\n}`);
                console.log("自动生成" + savePath)
            } catch (error)
            {
                console.log("error!!!!!\n" + error);
            }
        }
    };
}

function writeFile(filePath, content)
{
    fs.openSync(filePath, "w");
    fs.writeFileSync(filePath, content);
}

function readFile(filePath)
{
    fs.openSync(filePath, "r");
    var result = fs.readFileSync(filePath, 'utf8');
    return result;
}

function readFiles(filePaths)
{
    var result = {};
    filePaths.forEach(function (element)
    {
        result[element] = readFile(element);
    }, this);
    return result;
}

function getFilePaths(rootPath, filePaths)
{

    filePaths = filePaths || [];
    var stats = fs.statSync(rootPath);
    if (stats.isFile())
    {
        filePaths.push(rootPath);
    } else if (stats.isDirectory)
    {
        var childPaths = fs.readdirSync(rootPath);
        for (var i = 0; i < childPaths.length; i++)
        {
            getFilePaths(rootPath + "/" + childPaths[i], filePaths);
        }
    }
    return filePaths;
}