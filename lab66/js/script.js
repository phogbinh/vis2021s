window.onload = function() {
    function resizeRight() {
        d3.select('#train-vs-test')
            .style('width', d3.select('#right').node().clientWidth + 'px');
    }
    resizeRight();
    d3.select(window)
        .on('resize', function() {
            resizeRight();
        });

    var binaryDecisionTree = new BinaryDecisionTree({
        el: '#train-vs-test',
        trainingSection: '#training-section',
        testSection: '#testing-section',
        // flood: false // 資料點一剛開始會排隊
    });
    binaryDecisionTree.setDataFromJson('./model/dataset.json', function() {
        binaryDecisionTree.install();
        binaryDecisionTree.play();
    });
    // // 或者
    // binaryDecisionTree.setDataFromObject({
    //     tree_data: tree_data,
    //     tree_training_set: tree_training_set,
    //     tree_stats: tree_stats,
    //     tree_test_set: tree_test_set,
    //     test_stats: test_stats
    // });
    // // 同步函式，不需要 callback
    // binaryDecisionTree.install();
    // binaryDecisionTree.play();
};