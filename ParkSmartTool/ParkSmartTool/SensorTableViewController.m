//
//  SensorTableViewController.m
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/11/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import "SensorTableViewController.h"

#import "SensorTableViewCell.h"

@interface SensorTableViewController ()

@property (nonatomic, strong) NSArray *sensors;

- (IBAction)refreshData:(id)sender;

@end

@implementation SensorTableViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    UIRefreshControl *refresh = [UIRefreshControl new];
    [refresh addTarget:self action:@selector(refreshData:) forControlEvents:UIControlEventValueChanged];
    self.refreshControl = refresh;
    [self refreshData:nil];
}

- (void)refreshData:(id)sender
{
    NSString *urlString = [NSString stringWithFormat:@"http://%@:%ld/api/v1/sensors", self.server, self.port];
    [[[NSURLSession sharedSession] dataTaskWithURL:[NSURL URLWithString:urlString]
                                 completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                     NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                     dispatch_async(dispatch_get_main_queue(), ^{
                                         if(httpResponse.statusCode == 200){
                                             NSArray *sensors = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                                             self.sensors = sensors;
                                             [self.tableView reloadData];
                                         }
                                         [self.refreshControl endRefreshing];
                                     });
                                 }] resume];
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.sensors.count;
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    SensorTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"sensor" forIndexPath:indexPath];
    
    NSDictionary *sensor = self.sensors[indexPath.row];
    
    cell.sensorIdLabel.text = sensor[@"address"];
    cell.valueLabel.text = [sensor[@"lastValue"] stringValue];
    cell.timestampLabel.text = sensor[@"lastTransmission"];
    
    return cell;
}

#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}


@end
