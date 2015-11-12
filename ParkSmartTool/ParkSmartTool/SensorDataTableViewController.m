//
//  SensorDataTableViewController.m
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/11/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import "SensorDataTableViewController.h"

@interface SensorDataTableViewController ()

@property (nonatomic, strong) NSArray *data;

@property (nonatomic, strong) NSDateFormatter *dateParser;
@property (nonatomic, strong) NSDateFormatter *dateFormatter;

@end

@implementation SensorDataTableViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    UIRefreshControl *refresh = [UIRefreshControl new];
    [refresh addTarget:self action:@selector(refreshData:) forControlEvents:UIControlEventValueChanged];
    self.refreshControl = refresh;
    [self refreshData:nil];
    self.title = self.sensor[@"address"];
    
    self.dateParser = [NSDateFormatter new];
    [self.dateParser setDateFormat:@"yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'SSS'Z'"];
    self.dateFormatter = [NSDateFormatter new];
    [self.dateFormatter setDateFormat:@"MM/dd/yyyy HH:mm:ss"];
}

- (void)refreshData:(id)sender
{
    NSString *urlString = [NSString stringWithFormat:@"http://%@:%ld/api/v1/sensors/%@/historical", self.server, self.port, self.sensor[@"address"]];
    [[[NSURLSession sharedSession] dataTaskWithURL:[NSURL URLWithString:urlString]
                                 completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                     NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                     dispatch_async(dispatch_get_main_queue(), ^{
                                         if(httpResponse.statusCode == 200){
                                             NSArray *readings = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                                             self.data = [readings sortedArrayUsingDescriptors:@[[NSSortDescriptor sortDescriptorWithKey:@"createdAt" ascending:NO]]];
                                             [self.tableView reloadData];
                                         }
                                         [self.refreshControl endRefreshing];
                                     });
                                 }] resume];
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.data.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"sensorData"];
    if(cell == nil){
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"sensorData"];
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
    }
    
    NSDictionary *item = self.data[indexPath.row];
    cell.textLabel.text = [NSString stringWithFormat:@"Value: %@", item[@"value"]];
    NSDate *date = [self.dateParser dateFromString:item[@"createdAt"]];
    cell.detailTextLabel.text = [self.dateFormatter stringFromDate:date];
    
    if([item[@"submitted"] boolValue]){
        cell.backgroundColor = [UIColor colorWithRed:0 green:1 blue:0 alpha:0.5];
    } else {
        cell.backgroundColor = [UIColor colorWithRed:1 green:0 blue:0 alpha:0.5];
    }
    
    return cell;
}

@end
